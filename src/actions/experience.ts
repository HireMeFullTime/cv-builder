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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsedData = experienceSchema.parse(data);

  if (parsedData.id) {
    // Update existing
    const exp = await prisma.experience.update({
      where: { id: parsedData.id, userId: session.user.id },
      data: {
        jobTitle: parsedData.jobTitle,
        company: parsedData.company,
        location: parsedData.location,
        startDate: parsedData.startDate,
        endDate: parsedData.endDate,
        isCurrent: parsedData.isCurrent,
        description: parsedData.description,
        accomplishments: parsedData.accomplishments ? parsedData.accomplishments : undefined,
      },
    });
    revalidatePath("/dashboard");
    return exp;
  } else {
    // Create new
    const exp = await prisma.experience.create({
      data: {
        jobTitle: parsedData.jobTitle,
        company: parsedData.company,
        location: parsedData.location,
        startDate: parsedData.startDate,
        endDate: parsedData.endDate,
        isCurrent: parsedData.isCurrent,
        description: parsedData.description,
        accomplishments: parsedData.accomplishments ? parsedData.accomplishments : undefined,
        userId: session.user.id,
      },
    });
    revalidatePath("/dashboard");
    return exp;
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
