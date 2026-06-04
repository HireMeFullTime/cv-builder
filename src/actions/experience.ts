"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Fetches all work experiences created by the authenticated user.
 * Sorts them by active status (current jobs first), followed by end date and start date descending.
 * 
 * @returns A promise resolving to an array of user experiences.
 */
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

/**
 * Creates a new experience or updates an existing one for the authenticated user.
 * Validates data using Zod schema prior to database execution.
 * Revalidates the "/dashboard" path.
 * 
 * @param data - The experience data validated against experienceSchema.
 * @returns The created or updated experience object.
 */
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

/**
 * Deletes an experience by its ID, ensuring it belongs to the authenticated user.
 * Revalidates the "/dashboard" path.
 * 
 * @param id - The ID of the experience to delete.
 */
export async function deleteExperience(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.experience.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}
