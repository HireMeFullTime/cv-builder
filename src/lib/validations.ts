import { z } from "zod";

// --- PROFILE SCHEMA ---
export const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters long").max(50, "First name is too long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long").max(50, "Last name is too long"),
    title: z.string().max(100, "Title is too long").optional(),
    email: z.email("Invalid email address").max(255, "Email is too long"),
    phone: z.string().max(50, "Phone number is too long").optional(),
    location: z.string().max(100, "Location is too long").optional(),
    githubUrl: z.url("Invalid URL").max(255, "URL is too long").optional().or(z.literal("")),
    linkedinUrl: z.url("Invalid URL").max(255, "URL is too long").optional().or(z.literal("")),
    bio: z.string().max(2000, "Bio is too long (max 2000 characters)").optional(),
    gdprClause: z.string().max(2000, "GDPR clause is too long (max 2000 characters)").optional(),
});

// --- SKILL SCHEMA ---
export const skillSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Skill name is required").max(50, "Skill name is too long"),
    category: z.string().max(50, "Category name is too long").optional(),
});

export const skillsFormSchema = z.object({
    oldCategory: z.string().max(50).optional(),
    category: z.string().max(50).optional(),
    skills: z.array(z.string().max(50, "Skill name is too long")).min(1, "Add at least one skill"),
});

// --- PROJECT SCHEMA ---
export const projectSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, "Project title is required").max(100, "Title is too long"),
    shortDescription: z.string().min(10, "Short description is required (min. 10 characters)").max(500, "Description is too long (max 500 characters)"),
    role: z.string().max(100, "Role name is too long").optional(),
    techStack: z.array(z.string().max(50, "Technology name is too long")).min(1, "Select at least one technology"),
    accomplishments: z.array(
        z.object({
            value: z.string().min(3, "Accomplishment must be at least 3 characters long").max(500, "Accomplishment is too long"),
        })
    ).optional(),
    linkUrl: z.url("Invalid URL").max(255, "URL is too long").optional().or(z.literal("")),
    githubUrl: z.url("Invalid URL").max(255, "URL is too long").optional().or(z.literal("")),
    isCurrent: z.boolean(),
});

// --- EXPERIENCE SCHEMA ---
export const experienceSchema = z.object({
    id: z.string().optional(),
    jobTitle: z.string().min(2, "Job title is required").max(100, "Job title is too long"),
    company: z.string().min(2, "Company name is required").max(100, "Company name is too long"),
    location: z.string().max(100, "Location is too long").optional(),
    linkUrl: z.url("Invalid URL").max(255, "URL is too long").optional().or(z.literal("")),
    linkLabel: z.string().max(50, "Label is too long").optional().or(z.literal("")),
    startDate: z.date({ message: "Start Date is required" }),
    endDate: z.date().optional(),
    isCurrent: z.boolean(),
    description: z.string().max(2000, "Description is too long").optional(),
    accomplishments: z.array(
        z.object({
            value: z.string().min(3, "Accomplishment must be at least 3 characters long").max(500, "Accomplishment is too long"),
        })
    ).optional(),
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
    message: "End date cannot be earlier than start date",
    path: ["endDate"]
});

export const educationSchema = z.object({
    id: z.string().optional(),
    institution: z.string().min(2, "Institution / Provider name is required").max(100, "Name is too long"),
    degree: z.string().min(2, "Degree or Course name is required").max(100, "Name is too long"),
    fieldOfStudy: z.string().max(100, "Field of study is too long").optional(),
    startDate: z.date({ message: "Start Date is required" }),
    endDate: z.date().optional(),
    isCurrent: z.boolean(),
    description: z.string().max(1000, "Description is too long").optional(),
    url: z.url("Invalid URL").max(255, "URL is too long").optional().or(z.literal("")),
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
    message: "End date cannot be earlier than start date",
    path: ["endDate"]
});

export const languageSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Language name is required").max(50, "Language name is too long"),
    proficiency: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "Native"], {
        message: "Please select a valid proficiency level"
    }),
});

// --- AUTH SCHEMA ---
export const loginSchema = z.object({
    email: z.email("Invalid email address").max(255, "Email is too long"),
    password: z.string().min(1, "Password is required").max(100, "Password is too long"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
    email: z.email("Invalid email address").max(255, "Email is too long"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().max(100, "Password is too long")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// --- CV BUILDER SCHEMAS ---
export const cvBuilderFormSchema = z.object({
    jobTitle: z.string().min(3, "Job title is required").max(100, "Job title is too long"),
    jobDescription: z.string().min(20, "Please provide a detailed job description").max(10000, "Job description is too long (max 10000 chars)"),
    useDemoData: z.boolean().optional(),
});

export const generatedAccomplishmentSchema = z.object({
    value: z.string().describe("A single, impactful bullet point describing an accomplishment or responsibility.")
});

export const generatedExperienceSchema = z.object({
    id: z.string(),
    jobTitle: z.string(),
    company: z.string(),
    location: z.string().nullable(),
    linkUrl: z.url().nullable().optional(),
    linkLabel: z.string().nullable().optional(),
    startDate: z.string(),
    endDate: z.string().nullable().optional(),
    isCurrent: z.boolean(),
    accomplishments: z.array(generatedAccomplishmentSchema)
        .describe("Tailored accomplishments that strictly match the target job description. Limit to the most relevant points."),
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
    message: "End date cannot be earlier than start date",
    path: ["endDate"]
});

export const generatedProjectSchema = z.object({
    id: z.string(),
    title: z.string(),
    role: z.string().nullable().optional(),
    shortDescription: z.string(),
    linkUrl: z.url().nullable().optional(),
    githubUrl: z.url().nullable().optional(),
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
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
    message: "End date cannot be earlier than start date",
    path: ["endDate"]
});

export const tailoredCVSchema = z.object({
    jobTitleOverride: z.string().optional(),
    personalInfo: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        title: z.string().optional(),
        email: z.email().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        githubUrl: z.url().optional(),
        linkedinUrl: z.url().optional(),
        gdprClause: z.string().optional(),
    }).optional(),
    summary: z.string().describe("A 3-4 sentence summary tailored specifically to the job role, emphasizing relevant strengths from the user's background."),
    relevantSkills: z.array(z.string()).describe("A list of the most relevant skills for this specific job, ordered by importance. Exclude completely irrelevant skills."),
    selectedExperiences: z.array(generatedExperienceSchema).describe("The user's work experience, with accomplishments filtered or slightly adjusted to emphasize aspects most relevant to the target role."),
    projects: z.array(generatedProjectSchema).describe("The user's projects, filtered and tailored to show relevance to the job description. Do NOT include projects that are completely irrelevant."),
    professionalSummary: z.string().optional(),
    selectedProjects: z.array(generatedProjectSchema).optional(),
    selectedEducations: z.array(tailoredEducationSchema).optional(),
    languages: z.array(languageSchema).optional(),
});
