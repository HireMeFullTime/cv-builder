"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Fetches all education records created by the authenticated user.
 * Sorts them by active status (current studies first), followed by end date and start date descending.
 * 
 * @returns A promise resolving to an array of user education records.
 */
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

/**
 * Creates a new education record or updates an existing one for the authenticated user.
 * Validates data using Zod schema prior to database execution.
 * Revalidates the "/dashboard" path.
 * 
 * @param data - The education data validated against educationSchema.
 * @returns The created or updated education object.
 */
export async function upsertEducation(data: z.infer<typeof educationSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const parsedData = educationSchema.parse(data);

    const payload = {
      institution: parsedData.institution,
      degree: parsedData.degree,
      fieldOfStudy: parsedData.fieldOfStudy || null,
      startDate: parsedData.startDate,
      endDate: parsedData.endDate || null,
      isCurrent: parsedData.isCurrent,
      description: parsedData.description || null,
      url: parsedData.url || null,
    };

    if (parsedData.id) {
      const education = await prisma.education.update({
        where: { id: parsedData.id, userId: session.user.id },
        data: payload,
      });
      revalidatePath("/dashboard");
      return education;
    } else {
      const education = await prisma.education.create({
        data: { ...payload, userId: session.user.id },
      });
      revalidatePath("/dashboard");
      return education;
    }
  } catch (error) {
    console.error("Failed to upsert education:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save education data.");
  }
}

/**
 * Deletes an education record by its ID, ensuring it belongs to the authenticated user.
 * Revalidates the "/dashboard" path.
 * 
 * @param id - The ID of the education record to delete.
 */
export async function deleteEducation(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.education.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}
