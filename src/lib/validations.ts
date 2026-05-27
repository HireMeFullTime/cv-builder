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
    provider: z.enum(["github", "google"]),
});
