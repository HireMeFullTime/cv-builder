"use server";

import { Output, generateText } from "ai";
import { ParsedTailoredCV } from "@/types";
import { Prisma } from "@prisma/client";
import { TailoredCVData } from "@/types";
import { auth } from "@/auth";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { tailoredCVSchema } from "@/lib/validations";

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
      description: "Leading the frontend team in developing modern web applications.",
      linkUrl: "https://example.com/project",
      linkLabel: "Company Website",
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
      description: "Developed and maintained several React-based applications.",
      linkUrl: null,
      linkLabel: null,
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

/**
 * Generates a tailored CV using the Gemini AI model based on the target job requirements.
 * Validates the generated structure against tailoredCVSchema and stores it in the database.
 * Enforces a 1-minute rate limit per user.
 * 
 * @param jobTitle - Target job title.
 * @param jobDescription - The job listing description.
 * @param useDemoData - Optional flag to generate CV based on standard demo data.
 * @returns Result object containing success state, ID of the new CV, or error message.
 */
export async function generateTailoredCV(jobTitle: string, jobDescription: string, useDemoData: boolean = false) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  try {
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
      throw new Error("rate limit exceeded");
    }
    // ---------------------------------------------------------

    let candidateData;

    if (useDemoData) {
      candidateData = DEMO_CANDIDATE_DATA;
    } else {
      // Fetch all candidate data from the database in parallel.
      // We use Promise.all to optimize query time since all queries are independent.
      const [profile, experiences, projects, skills, educations, languages] = await Promise.all([
        prisma.profile.findUnique({ where: { userId } }),
        prisma.experience.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
        prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
        prisma.skill.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
        prisma.education.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
        prisma.language.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      ]);

      if (!profile) {
        // Profile is required as an absolute minimum to generate a CV.
        throw new Error("Profile must be completed before generating a CV.");
      }

      candidateData = {
        profile: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          title: profile.title,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          githubUrl: profile.githubUrl,
          linkedinUrl: profile.linkedinUrl,
          bio: profile.bio,
          gdprClause: profile.gdprClause,
        },
        skills: skills.map(s => s.name),
        experiences: experiences.map(exp => ({
          id: exp.id,
          jobTitle: exp.jobTitle,
          company: exp.company,
          location: exp.location,
          linkUrl: exp.linkUrl,
          linkLabel: exp.linkLabel,
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
        })),
        educations: educations.map(edu => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate.toISOString(),
          endDate: edu.endDate?.toISOString() || null,
          isCurrent: edu.isCurrent,
          description: edu.description,
        })),
        languages: languages.map(lang => ({
          id: lang.id,
          name: lang.name,
          proficiency: lang.proficiency,
        })),
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
1. If the candidate provided a 'bio' in their personalInfo, you MUST use it as the base. You are ONLY allowed to: (a) reorder the technologies mentioned to prioritize ones relevant to the job description, (b) add ONE short clause connecting to the job's specific focus (e.g. "with a focus on testing" if the job emphasizes testing). You are NOT allowed to: rewrite sentence structure, add adjectives describing personality or character, add phrases like "strong candidate" or "eager to", or change the overall length. The result must be recognizably the same text as the original bio, not a rewritten version. If 'bio' is empty or missing, write a completely new one based on their experience, MAXIMUM 2 sentences, in English. Do not use the words or phrases: "passionate", "eager to", "strong candidate", "creative and curious", "dynamic". Do not restate skills that are already listed elsewhere — focus only on level of experience and direction.
2. Select and order the most relevant skills from the candidate's list. You MUST ALSO extract and include any relevant technologies mentioned in the candidate's projects (techStack) or experiences, even if they are not explicitly listed in the skills list. Exclude completely irrelevant ones. Write the skills in english.
3. Select the most relevant work experiences. For each experience entry, select MAXIMUM 3 accomplishments — the ones most relevant to the job description. Do not include more than 3 even if more exist in the raw data. Filter or rewrite accomplishments to highlight overlap with the job description. Do NOT hallucinate entirely new experiences, only adjust descriptions of existing ones. Use the exact same IDs. Never omit, alter, or leave blank the startDate/endDate fields — copy them exactly as provided in the raw data, even when rewriting accomplishments.
4. Select the most relevant projects. Filter out projects that do not match the tech stack or domain of the job description. For each project's 'shortDescription', write MAXIMUM 1 sentence (under 20 words) — do not describe the project's purpose across multiple sentences; save detail for accomplishments. Use the exact same IDs.
5. Include ALL education entries and ALL languages from the candidate data as-is. Do not filter them out. Use the exact same IDs.
6. Return the result strictly in valid JSON format matching the following structure. Do not include markdown code blocks.
{
  "summary": "string",
  "relevantSkills": ["string"],
  "selectedExperiences": [
    {
      "id": "string",
      "jobTitle": "string",
      "company": "string",
      "location": "string | null",
      "linkUrl": "string | null",
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
  ],
  "selectedEducations": [
    {
      "id": "string",
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string | null",
      "startDate": "string (ISO)",
      "endDate": "string (ISO) | null",
      "isCurrent": boolean,
      "description": "string | null"
    }
  ],
  "languages": [
    {
      "id": "string",
      "name": "string",
      "proficiency": "string"
    }
  ]
}
`;


    // Call the Gemini API using the Vercel AI SDK.
    // We omit legacy duplicate fields to save tokens and prevent LLM confusion.
    const aiPromptCVSchema = tailoredCVSchema.omit({ professionalSummary: true, selectedProjects: true });

    const { output: object } = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({ schema: aiPromptCVSchema }),
      prompt: systemPrompt,
    });

    // Double assurance: validate the received object (which was already pre-validated by AI SDK).
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
    } else {
      validatedContent.personalInfo = {
        firstName: candidateData.profile.firstName,
        lastName: candidateData.profile.lastName,
        title: candidateData.profile.title ?? undefined,
        email: candidateData.profile.email,
        phone: candidateData.profile.phone ?? undefined,
        location: candidateData.profile.location ?? undefined,
        githubUrl: candidateData.profile.githubUrl ?? undefined,
        linkedinUrl: candidateData.profile.linkedinUrl ?? undefined,
        gdprClause: candidateData.profile.gdprClause ?? undefined,
      };
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

    let friendlyMessage = "We encountered an unexpected issue while communicating with the AI service. Please try again later.";

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes("rate limit exceeded")) {
        friendlyMessage = "You're generating CVs too quickly! Please wait a minute before trying again.";
      } else if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted")) {
        friendlyMessage = "The AI service is currently overloaded or out of quota. Please try again in a few minutes.";
      } else if (msg.includes("json") || msg.includes("parse") || error.name === 'ZodError') {
        friendlyMessage = "The AI generated an invalid response format. Please try generating again.";
      } else if (msg.includes("timeout") || msg.includes("abort") || msg.includes("fetch")) {
        friendlyMessage = "The AI service took too long to respond or there is a network issue. Please try again.";
      }
    }

    return { success: false, error: friendlyMessage };
  }
}

/**
 * Fetches all tailored CVs created by the currently authenticated user.
 * Sorts them by creation date descending.
 * 
 * @returns A promise resolving to an array of parsed tailored CVs.
 */
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

/**
 * Fetches a single tailored CV by its ID, ensuring it belongs to the authenticated user.
 * 
 * @param id - The ID of the tailored CV.
 * @returns A promise resolving to the parsed tailored CV, or null if not found/unauthorized.
 */
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

/**
 * Deletes a tailored CV by its ID, ensuring it belongs to the authenticated user.
 * Revalidates the "/dashboard" path to update server-rendered data.
 * 
 * @param id - The ID of the tailored CV to delete.
 */
export async function deleteTailoredCV(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.tailoredCV.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to delete tailored CV:", error);
    throw new Error("Failed to delete tailored CV");
  }
}

/**
 * Updates the contents of a tailored CV by its ID, ensuring it belongs to the authenticated user.
 * Validates the new content structure using Zod before updating.
 * Revalidates the "/dashboard" path.
 * 
 * @param id - The ID of the tailored CV to update.
 * @param content - The new tailored CV data.
 */
export async function updateTailoredCV(id: string, content: TailoredCVData) {
  try {
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
  } catch (error) {
    console.error("Failed to update tailored CV:", error);
    throw new Error("Failed to update tailored CV");
  }
}
