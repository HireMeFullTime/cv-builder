"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { skillsFormSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getSkills() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.skill.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertSkillCategory(data: z.infer<typeof skillsFormSchema>) {
  try {

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const parsedData = skillsFormSchema.parse(data);
    const userId = session.user.id;
    const targetCategory = parsedData.oldCategory || null;

    await prisma.$transaction(async (tx) => {
      await tx.skill.deleteMany({
        where: {
          userId: userId,
          category: targetCategory,
        },
      });

      const newSkills = parsedData.skills.map((skillName) => ({
        name: skillName,
        category: parsedData.category || null,
        userId: userId,
      }));

      if (newSkills.length > 0) {
        await tx.skill.createMany({
          data: newSkills,
        });
      }
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to upsert skills:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save skills data.");
  }
}

export async function deleteSkillCategory(category: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.skill.deleteMany({
    where: {
      userId: session.user.id,
      category: category,
    },
  });

  revalidatePath("/dashboard");
}
