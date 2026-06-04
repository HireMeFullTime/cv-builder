"use server";

import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

/**
 * Signs out the currently authenticated user session.
 */
export async function signOutAction() {
  await signOut();
}

/**
 * Registers a new user in the database.
 * Hashes the user password using bcryptjs and checks for existing emails.
 * 
 * @param data - The registration data validated against registerSchema.
 * @returns Result object containing success status or error message.
 */
export async function registerUser(data: z.infer<typeof registerSchema>) {
  try {
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid registration data" };
    }
    console.error("Error registering user:", error);
    return { error: "Failed to register user. Please try again later." };
  }
}
