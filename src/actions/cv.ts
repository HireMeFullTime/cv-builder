"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { revalidatePath } from "next/cache";
import { tailoredCVSchema } from "@/lib/validations";
import { ParsedTailoredCV } from "@/types";
import { generateText, Output } from "ai";
import { Prisma } from "@prisma/client";
import { TailoredCVData } from "@/types";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const DEMO_CANDIDATE_DATA = {
  profile: {
    firstName: "Alex",
    lastName: "Demo",
    title: "Senior Frontend Developer",
    email: "alex.demo@example.com",
    phone: "+1 234 567 890",
    location: "Remote",
    githubUrl: "https://github.com/alexdemo",
    linkedinUrl: "https://linkedin.com/in/alexdemo",
    bio: "Passionate Senior Frontend Developer with over 6 years of experience building scalable web applications using React, Next.js, and TypeScript.",
    gdprClause: "I agree to the processing of personal data provided in this document for realising the recruitment process pursuant to the Personal Data Protection Act of 10 May 2018 (Journal of Laws 2018, item 1000) and in agreement with Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, and repealing Directive 95/46/EC (General Data Protection Regulation).",
  },
  skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Node.js", "GraphQL", "Redux", "Jest", "Git"],
  experiences: [
    {
      id: "demo-exp-1",
      jobTitle: "Senior Frontend Engineer",
      company: "TechNova Solutions",
      location: "San Francisco, CA",
      startDate: "2020-03-01T00:00:00.000Z",
      endDate: null,
      isCurrent: true,
      description: "Leading the frontend team in building a high-performance SaaS platform.",
      accomplishments: [
        { value: "Architected and migrated legacy React codebase to Next.js App Router, improving load times by 40%." },
        { value: "Mentored 4 junior developers and established strict TypeScript and ESLint standards." },
        { value: "Implemented a fully accessible component library using Radix UI and Tailwind CSS." }
      ]
    },
    {
      id: "demo-exp-2",
      jobTitle: "Frontend Developer",
      company: "WebFlow Agency",
      location: "New York, NY",
      startDate: "2017-06-01T00:00:00.000Z",
      endDate: "2020-02-28T00:00:00.000Z",
      isCurrent: false,
      description: "Developed custom web applications for enterprise clients.",
      accomplishments: [
        { value: "Built 15+ responsive websites using React and Redux." },
        { value: "Integrated third-party APIs (Stripe, Twilio) reducing manual processing time by 30%." }
      ]
    }
  ],
  projects: [
    {
      id: "demo-proj-1",
      title: "E-Commerce Dashboard",
      role: "Lead Developer",
      shortDescription: "A comprehensive analytics dashboard for e-commerce store owners.",
      linkUrl: "https://demo-dashboard.example.com",
      githubUrl: "https://github.com/alexdemo/dashboard",
      techStack: ["Next.js", "TypeScript", "Recharts", "Prisma"],
      accomplishments: [
        { value: "Handled real-time data visualization of over 100k daily transactions." },
        { value: "Achieved 99/100 Lighthouse performance score." }
      ]
    }
  ],
  educations: [
    {
      id: "demo-edu-1",
      institution: "University of Technology",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startDate: "2013-09-01T00:00:00.000Z",
      endDate: "2017-06-01T00:00:00.000Z",
      isCurrent: false,
      description: "Graduated with honors. Specialized in Human-Computer Interaction."
    }
  ]
};

export async function generateTailoredCV(jobTitle: string, jobDescription: string, useDemoData: boolean = false) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // --- Rate Limiting (Database) ---
  const oneMinuteAgo = new Date(Date.now() - 60000);

  const recentGenerationsCount = await prisma.tailoredCV.count({
    where: {
      userId,
      createdAt: {
        gte: oneMinuteAgo
      }
    }
  });

  if (recentGenerationsCount >= 1) {
    throw new Error("Rate limit exceeded. Please wait a minute before generating again.");
  }
  // ---------------------------------------------------------

  let candidateData;

  if (useDemoData) {
    candidateData = DEMO_CANDIDATE_DATA;
  } else {
    const [profile, experiences, projects, skills] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.experience.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
      prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.skill.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    ]);

    if (!profile) {
      throw new Error("Profile must be completed before generating a CV.");
    }

    candidateData = {
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
  }

  const systemPrompt = `
You are an expert IT Technical Recruiter and CV Writer. 
Your task is to tailor a candidate's CV data to perfectly match a target Job Description.

TARGET JOB TITLE: ${jobTitle}
TARGET JOB DESCRIPTION:
${jobDescription}

CANDIDATE RAW DATA (JSON):
${JSON.stringify(candidateData, null, 2)}

INSTRUCTIONS:
1. Write a compelling 3-4 sentence summary tailored to this specific job only in english.
2. Select and order the most relevant skills from the candidate's list. Exclude completely irrelevant ones. Write the skills in english.
3. Select the most relevant work experiences. Filter or rewrite accomplishments to highlight overlap with the job description. Do NOT hallucinate entirely new experiences, only adjust descriptions of existing ones. Use the exact same IDs.
4. Select the most relevant projects. Filter out projects that do not match the tech stack or domain of the job description. Use the exact same IDs.
5. Return the result strictly in valid JSON format matching the following structure. Do not include markdown code blocks.
{
  "summary": "string",
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
  "projects": [
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
    const { output: object } = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({ schema: tailoredCVSchema }),
      prompt: systemPrompt,
    });

    const validatedContent = tailoredCVSchema.parse(object);

    if (useDemoData) {
      validatedContent.personalInfo = {
        firstName: DEMO_CANDIDATE_DATA.profile.firstName,
        lastName: DEMO_CANDIDATE_DATA.profile.lastName,
        title: DEMO_CANDIDATE_DATA.profile.title,
        email: DEMO_CANDIDATE_DATA.profile.email,
        phone: DEMO_CANDIDATE_DATA.profile.phone,
        location: DEMO_CANDIDATE_DATA.profile.location,
        githubUrl: DEMO_CANDIDATE_DATA.profile.githubUrl,
        linkedinUrl: DEMO_CANDIDATE_DATA.profile.linkedinUrl,
        gdprClause: DEMO_CANDIDATE_DATA.profile.gdprClause,
      };
      validatedContent.selectedEducations = DEMO_CANDIDATE_DATA.educations;
    }

    const tailoredCV = await prisma.tailoredCV.create({
      data: {
        jobTitle,
        jobDescription,
        generatedContent: validatedContent as Prisma.InputJsonValue,
        userId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, id: tailoredCV.id };
  } catch (error) {
    console.error("AI Generation Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during AI generation";
    return { success: false, error: `Generation failed: ${errorMessage}` };
  }
}

export async function getTailoredCVs(): Promise<ParsedTailoredCV[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const cvs = await prisma.tailoredCV.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return cvs
    .map((cv) => {
      const parsed = tailoredCVSchema.safeParse(cv.generatedContent);
      if (!parsed.success) return null;
      return {
        ...cv,
        generatedContent: parsed.data,
      };
    })
    .filter((cv): cv is ParsedTailoredCV => cv !== null);
}

export async function getTailoredCVById(id: string): Promise<ParsedTailoredCV | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const cv = await prisma.tailoredCV.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!cv) return null;

  const parsed = tailoredCVSchema.safeParse(cv.generatedContent);
  if (!parsed.success) return null;

  return {
    ...cv,
    generatedContent: parsed.data,
  };
}

export async function deleteTailoredCV(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.tailoredCV.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}

export async function updateTailoredCV(id: string, content: TailoredCVData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Validate the content against the schema
  const parsedContent = tailoredCVSchema.parse(content);

  await prisma.tailoredCV.update({
    where: { id, userId: session.user.id },
    data: {
      generatedContent: parsedContent as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard");
}
