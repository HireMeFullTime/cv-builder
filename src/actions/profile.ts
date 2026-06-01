"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function upsertProfile(data: z.infer<typeof profileSchema>) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const parsedData = profileSchema.parse(data);

    const safeUpdateData = {
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
      title: parsedData.title || null,
      email: parsedData.email,
      phone: parsedData.phone || null,
      location: parsedData.location || null,
      githubUrl: parsedData.githubUrl || null,
      linkedinUrl: parsedData.linkedinUrl || null,
      bio: parsedData.bio || null,
      gdprClause: parsedData.gdprClause || null,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: safeUpdateData,
      create: {
        ...safeUpdateData,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return profile;
  } catch (error) {
    console.error("Failed to upsert profile:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save profile data.");
  }
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
}
