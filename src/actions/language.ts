"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { languageSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getLanguages() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.language.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertLanguage(data: z.infer<typeof languageSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsedData = languageSchema.parse(data);

  if (parsedData.id) {
    const language = await prisma.language.update({
      where: { id: parsedData.id, userId: session.user.id },
      data: {
        name: parsedData.name,
        proficiency: parsedData.proficiency,
      },
    });
    revalidatePath("/dashboard");
    return language;
  } else {
    const language = await prisma.language.create({
      data: {
        name: parsedData.name,
        proficiency: parsedData.proficiency,
        userId: session.user.id,
      },
    });
    revalidatePath("/dashboard");
    return language;
  }
}

export async function deleteLanguage(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.language.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}
