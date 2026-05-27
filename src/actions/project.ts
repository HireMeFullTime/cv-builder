"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertProject(data: z.infer<typeof projectSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsedData = projectSchema.parse(data);

  if (parsedData.id) {
    const project = await prisma.project.update({
      where: { id: parsedData.id, userId: session.user.id },
      data: {
        title: parsedData.title,
        shortDescription: parsedData.shortDescription,
        role: parsedData.role ? parsedData.role : undefined,
        linkUrl: parsedData.linkUrl ? parsedData.linkUrl : undefined,
        githubUrl: parsedData.githubUrl ? parsedData.githubUrl : undefined,
        isCurrent: parsedData.isCurrent,
        techStack: parsedData.techStack,
        accomplishments: parsedData.accomplishments ? parsedData.accomplishments : undefined,
      },
    });
    revalidatePath("/dashboard");
    return project;
  } else {
    const project = await prisma.project.create({
      data: {
        title: parsedData.title,
        shortDescription: parsedData.shortDescription,
        role: parsedData.role ? parsedData.role : undefined,
        linkUrl: parsedData.linkUrl ? parsedData.linkUrl : undefined,
        githubUrl: parsedData.githubUrl ? parsedData.githubUrl : undefined,
        isCurrent: parsedData.isCurrent,
        techStack: parsedData.techStack,
        accomplishments: parsedData.accomplishments ? parsedData.accomplishments : undefined,
        userId: session.user.id,
      },
    });
    revalidatePath("/dashboard");
    return project;
  }
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.project.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}
