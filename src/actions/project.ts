"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Fetches all projects created by the authenticated user.
 * Sorts them by creation date descending.
 * 
 * @returns A promise resolving to an array of user projects.
 */
export async function getProjects() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Creates a new project or updates an existing one for the authenticated user.
 * Validates data using Zod schema prior to database execution.
 * Revalidates the "/dashboard" path.
 * 
 * @param data - The project data validated against projectSchema.
 * @returns The created or updated project object.
 */
export async function upsertProject(data: z.infer<typeof projectSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const parsedData = projectSchema.parse(data);

    const payload = {
      title: parsedData.title,
      shortDescription: parsedData.shortDescription,
      role: parsedData.role || null,
      linkUrl: parsedData.linkUrl || null,
      githubUrl: parsedData.githubUrl || null,
      isCurrent: parsedData.isCurrent,
      techStack: parsedData.techStack,
      accomplishments: parsedData.accomplishments ?? undefined,
    };

    if (parsedData.id) {
      const project = await prisma.project.update({
        where: { id: parsedData.id, userId: session.user.id },
        data: payload,
      });
      revalidatePath("/dashboard");
      return project;
    } else {
      const project = await prisma.project.create({
        data: { ...payload, userId: session.user.id },
      });
      revalidatePath("/dashboard");
      return project;
    }
  } catch (error) {
    console.error("Failed to upsert project:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save project data.");
  }
}

/**
 * Deletes a project by its ID, ensuring it belongs to the authenticated user.
 * Revalidates the "/dashboard" path.
 * 
 * @param id - The ID of the project to delete.
 */
export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.project.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}
