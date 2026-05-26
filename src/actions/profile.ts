"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";
import { z } from "zod";

export async function upsertProfile(data: z.infer<typeof profileSchema>) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ensure data conforms to the schema
  const parsedData = profileSchema.parse(data);

  // Update or create profile linked to this user
  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: parsedData,
    create: {
      ...parsedData,
      userId: session.user.id,
    },
  });

  return profile;
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  return prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
}
