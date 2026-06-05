"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { skillsFormSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Fetches all skills created by the authenticated user.
 * Sorts them by creation date ascending.
 * 
 * @returns A promise resolving to an array of user skills.
 */
export async function getSkills() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.skill.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Saves (creates/updates) a group of skills under a specific category for the authenticated user.
 * Performs a transaction that first removes existing skills in the category and then inserts the new list.
 * Revalidates the "/dashboard" path.
 * 
 * @param data - The skills data containing the category and array of skill names.
 */
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

/**
 * Deletes all skills belonging to a specific category for the authenticated user.
 * Revalidates the "/dashboard" path.
 * 
 * @param category - The name of the skill category to delete (can be null/empty).
 */
export async function deleteSkillCategory(category: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (!category) {
      // Deleting uncategorized skills
      await prisma.skill.deleteMany({
        where: { userId: session.user.id, OR: [{ category: "" }, { category: null }] },
      });
    } else {
      await prisma.skill.deleteMany({
        where: { userId: session.user.id, category },
      });
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to delete skill category:", error);
    throw new Error("Failed to delete skill category");
  }
}
