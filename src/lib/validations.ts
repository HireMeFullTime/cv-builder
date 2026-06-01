import { z } from "zod";

// --- PROFILE SCHEMA ---
export const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    title: z.string().optional(),
    email: z.email("Invalid email address"),
    phone: z.string().optional(),
    location: z.string().optional(),
    githubUrl: z.url("Invalid URL").optional().or(z.literal("")),
    linkedinUrl: z.url("Invalid URL").optional().or(z.literal("")),
    bio: z.string().optional(),
    gdprClause: z.string().optional(),
});

// --- SKILL SCHEMA ---
export const skillSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Skill name is required"),
    category: z.string().optional(),
});

export const skillsFormSchema = z.object({
    oldCategory: z.string().optional(),
    category: z.string().optional(),
    skills: z.array(z.string()).min(1, "Add at least one skill"),
});

// --- PROJECT SCHEMA ---
export const projectSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, "Project title is required"),
    shortDescription: z.string().min(10, "Short description is required (min. 10 characters)"),
    role: z.string().optional(),
    techStack: z.array(z.string()).min(1, "Select at least one technology"),
    accomplishments: z.array(
        z.object({
            value: z.string().min(3, "Accomplishment must be at least 3 characters long"),
        })
    ).optional(),
    linkUrl: z.url("Invalid URL").optional().or(z.literal("")),
    githubUrl: z.url("Invalid URL").optional().or(z.literal("")),
    isCurrent: z.boolean(),
});

// --- EXPERIENCE SCHEMA ---
export const experienceSchema = z.object({
    id: z.string().optional(),
    jobTitle: z.string().min(2, "Job title is required"),
    company: z.string().min(2, "Company name is required"),
    location: z.string().optional(),
    startDate: z.date({ message: "Start Date is required" }),
    endDate: z.date().optional(),
    isCurrent: z.boolean(),
    description: z.string().optional(),
    accomplishments: z.array(
        z.object({
            value: z.string().min(3, "Accomplishment must be at least 3 characters long"),
        })
    ).optional(),
});

export const educationSchema = z.object({
    id: z.string().optional(),
    institution: z.string().min(2, "Institution / Provider name is required"),
    degree: z.string().min(2, "Degree or Course name is required"),
    fieldOfStudy: z.string().optional(),
    startDate: z.date({ message: "Start Date is required" }),
    endDate: z.date().optional(),
    isCurrent: z.boolean(),
    description: z.string().optional(),
    url: z.url("Invalid URL").optional().or(z.literal("")),
});

export const languageSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Language name is required"),
    proficiency: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "Native"], {
        message: "Please select a valid proficiency level"
    }),
});

// --- AUTH SCHEMA ---
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// --- CV BUILDER SCHEMAS ---
export const cvBuilderFormSchema = z.object({
    jobTitle: z.string().min(3, "Job title is required"),
    jobDescription: z.string().min(20, "Please provide a detailed job description"),
    useDemoData: z.boolean().optional(),
});

export const generatedAccomplishmentSchema = z.object({
    value: z.string().describe("A single, impactful bullet point describing an accomplishment or responsibility.")
});

export const generatedExperienceSchema = z.object({
    id: z.string(),
    jobTitle: z.string(),
    company: z.string(),
    location: z.string().nullable().optional(),
    startDate: z.string(),
    endDate: z.string().nullable().optional(),
    isCurrent: z.boolean(),
    accomplishments: z.array(generatedAccomplishmentSchema)
        .describe("Tailored accomplishments that strictly match the target job description. Limit to the most relevant points."),
});

export const generatedProjectSchema = z.object({
    id: z.string(),
    title: z.string(),
    role: z.string().nullable().optional(),
    shortDescription: z.string(),
    linkUrl: z.string().nullable().optional(),
    githubUrl: z.string().nullable().optional(),
    accomplishments: z.array(generatedAccomplishmentSchema)
        .describe("Tailored project highlights relevant to the job."),
    techStack: z.array(z.string())
});

export const tailoredEducationSchema = z.object({
    id: z.string(),
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string().nullable().optional(),
    startDate: z.string(),
    endDate: z.string().nullable().optional(),
    isCurrent: z.boolean(),
    description: z.string().nullable().optional(),
});

export const tailoredCVSchema = z.object({
    jobTitleOverride: z.string().optional(),
    personalInfo: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        title: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        githubUrl: z.string().optional(),
        linkedinUrl: z.string().optional(),
        gdprClause: z.string().optional(),
    }).optional(),
    summary: z.string().describe("A 3-4 sentence summary tailored specifically to the job role, emphasizing relevant strengths from the user's background."),
    relevantSkills: z.array(z.string()).describe("A list of the most relevant skills for this specific job, ordered by importance. Exclude completely irrelevant skills."),
    selectedExperiences: z.array(generatedExperienceSchema).describe("The user's work experience, with accomplishments filtered or slightly adjusted to emphasize aspects most relevant to the target role."),
    projects: z.array(generatedProjectSchema).describe("The user's projects, filtered and tailored to show relevance to the job description. Do NOT include projects that are completely irrelevant."),
    professionalSummary: z.string().optional(),
    selectedProjects: z.array(generatedProjectSchema).optional(),
    selectedEducations: z.array(tailoredEducationSchema).optional(),
    languages: z.array(z.any()).optional(),
});
