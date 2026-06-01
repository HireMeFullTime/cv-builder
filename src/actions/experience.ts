"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getExperiences() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.experience.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { isCurrent: "desc" },
      { endDate: "desc" },
      { startDate: "desc" },
    ],
  });
}

export async function upsertExperience(data: z.infer<typeof experienceSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const parsedData = experienceSchema.parse(data);

    const payload = {
      jobTitle: parsedData.jobTitle,
      company: parsedData.company,
      location: parsedData.location || null,
      startDate: parsedData.startDate,
      endDate: parsedData.endDate || null,
      isCurrent: parsedData.isCurrent,
      description: parsedData.description || null,
      accomplishments: parsedData.accomplishments ?? undefined,
    };

    if (parsedData.id) {
      const exp = await prisma.experience.update({
        where: { id: parsedData.id, userId: session.user.id },
        data: payload,
      });
      revalidatePath("/dashboard");
      return exp;
    } else {
      const exp = await prisma.experience.create({
        data: { ...payload, userId: session.user.id },
      });
      revalidatePath("/dashboard");
      return exp;
    }
  } catch (error) {
    console.error("Failed to upsert experience:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save experience data.");
  }
}

export async function deleteExperience(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.experience.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}
