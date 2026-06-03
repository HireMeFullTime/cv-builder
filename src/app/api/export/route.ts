import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      experiences: true,
      projects: true,
      educations: true,
      skills: true,
      languages: true,
      tailoredCVs: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const stripMeta = <T extends Record<string, unknown>>(item: T | null) => {
    if (!item) return item;
    const { id, userId, createdAt, updatedAt, ...rest } = item;
    return rest;
  };

  const exportData = {
    name: user.name,
    email: user.email,
    image: user.image,
    profile: stripMeta(user.profile),
    experiences: user.experiences.map(stripMeta),
    projects: user.projects.map(stripMeta),
    educations: user.educations.map(stripMeta),
    skills: user.skills.map(stripMeta),
    languages: user.languages.map(stripMeta),
    tailoredCVs: user.tailoredCVs.map(stripMeta),
  };

  const fileName = `cv_export_${new Date().toISOString().split("T")[0]}.json`;

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
