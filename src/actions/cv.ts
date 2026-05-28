"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { revalidatePath } from "next/cache";
import { tailoredCVSchema } from "@/lib/validations";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function generateTailoredCV(jobTitle: string, jobDescription: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

   const [profile, experiences, projects, skills] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.experience.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
    prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.skill.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  if (!profile) {
    throw new Error("Profile must be completed before generating a CV.");
  }

   const candidateData = {
    profile: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      title: profile.title,
      bio: profile.bio,
    },
    skills: skills.map(s => s.name),
    experiences: experiences.map(exp => ({
      id: exp.id,
      jobTitle: exp.jobTitle,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate?.toISOString() || null,
      isCurrent: exp.isCurrent,
      description: exp.description,
      accomplishments: exp.accomplishments,
    })),
    projects: projects.map(proj => ({
      id: proj.id,
      title: proj.title,
      role: proj.role,
      shortDescription: proj.shortDescription,
      linkUrl: proj.linkUrl,
      githubUrl: proj.githubUrl,
      techStack: proj.techStack,
      accomplishments: proj.accomplishments,
    }))
  };

   const systemPrompt = `
You are an expert IT Technical Recruiter and CV Writer. 
Your task is to tailor a candidate's CV data to perfectly match a target Job Description.

TARGET JOB TITLE: ${jobTitle}
TARGET JOB DESCRIPTION:
${jobDescription}

CANDIDATE RAW DATA (JSON):
${JSON.stringify(candidateData, null, 2)}

INSTRUCTIONS:
1. Write a compelling 3-4 sentence professional summary tailored to this specific job.
2. Select and order the most relevant skills from the candidate's list. Exclude completely irrelevant ones.
3. Select the most relevant work experiences. Filter or rewrite accomplishments to highlight overlap with the job description. Do NOT hallucinate entirely new experiences, only adjust descriptions of existing ones. Use the exact same IDs.
4. Select the most relevant projects. Filter out projects that do not match the tech stack or domain of the job description. Use the exact same IDs.
5. Return the result strictly in valid JSON format matching the following structure. Do not include markdown code blocks.
{
  "professionalSummary": "string",
  "relevantSkills": ["string"],
  "selectedExperiences": [
    {
      "id": "string",
      "jobTitle": "string",
      "company": "string",
      "location": "string | null",
      "startDate": "string (ISO)",
      "endDate": "string (ISO) | null",
      "isCurrent": boolean,
      "accomplishments": [{ "value": "string" }]
    }
  ],
  "selectedProjects": [
    {
      "id": "string",
      "title": "string",
      "role": "string | null",
      "shortDescription": "string",
      "linkUrl": "string | null",
      "githubUrl": "string | null",
      "techStack": ["string"],
      "accomplishments": [{ "value": "string" }]
    }
  ]
}
`;

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: systemPrompt,
    });

    const jsonString = text.replace(/```json\n?|```/g, "").trim();
    const object = tailoredCVSchema.parse(JSON.parse(jsonString));

      const tailoredCV = await prisma.tailoredCV.create({
      data: {
        jobTitle,
        jobDescription,
        generatedContent: object as any,
        userId,
      },
    });

    revalidatePath("/dashboard");
    return tailoredCV.id;
  } catch (error) {
    console.error("AI Generation Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during AI generation";
    throw new Error(`Generation failed: ${errorMessage}`);
  }
}

export async function getTailoredCVs() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.tailoredCV.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTailoredCVById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.tailoredCV.findUnique({
    where: { id, userId: session.user.id },
  });
}

export async function deleteTailoredCV(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.tailoredCV.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}
