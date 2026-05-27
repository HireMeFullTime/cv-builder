"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getEducations() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.education.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { isCurrent: "desc" },
      { endDate: "desc" },
      { startDate: "desc" },
    ],
  });
}

export async function upsertEducation(data: z.infer<typeof educationSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsedData = educationSchema.parse(data);

  if (parsedData.id) {
    const education = await prisma.education.update({
      where: { id: parsedData.id, userId: session.user.id },
      data: {
        institution: parsedData.institution,
        degree: parsedData.degree,
        fieldOfStudy: parsedData.fieldOfStudy || null,
        startDate: parsedData.startDate,
        endDate: parsedData.endDate || null,
        isCurrent: parsedData.isCurrent,
        description: parsedData.description || null,
        url: parsedData.url || null,
      },
    });
    revalidatePath("/dashboard");
    return education;
  } else {
    const education = await prisma.education.create({
      data: {
        institution: parsedData.institution,
        degree: parsedData.degree,
        fieldOfStudy: parsedData.fieldOfStudy || null,
        startDate: parsedData.startDate,
        endDate: parsedData.endDate || null,
        isCurrent: parsedData.isCurrent,
        description: parsedData.description || null,
        url: parsedData.url || null,
        userId: session.user.id,
      },
    });
    revalidatePath("/dashboard");
    return education;
  }
}

export async function deleteEducation(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.education.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}
