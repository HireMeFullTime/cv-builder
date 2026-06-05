"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { languageSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Fetches all language proficiency records created by the authenticated user.
 * Sorts them by creation date ascending.
 * 
 * @returns A promise resolving to an array of user languages.
 */
export async function getLanguages() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.language.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Creates a new language proficiency record or updates an existing one for the authenticated user.
 * Validates data using Zod schema prior to database execution.
 * Revalidates the "/dashboard" path.
 * 
 * @param data - The language data validated against languageSchema.
 * @returns The created or updated language object.
 */
export async function upsertLanguage(data: z.infer<typeof languageSchema>) {
  try {
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
  } catch (error) {
    console.error("Failed to upsert language:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save language data.");
  }
}

/**
 * Deletes a language proficiency record by its ID, ensuring it belongs to the authenticated user.
 * Revalidates the "/dashboard" path.
 * 
 * @param id - The ID of the language record to delete.
 */
export async function deleteLanguage(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.language.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to delete language:", error);
    throw new Error("Failed to delete language");
  }
}
