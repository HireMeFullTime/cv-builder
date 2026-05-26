import { z } from "zod";

// --- PROFILE SCHEMA ---
export const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    title: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    location: z.string().optional(),
    githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    bio: z.string().optional(),
    gdprClause: z.string().optional(),
});

// --- SKILL SCHEMA ---
export const skillSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Skill name is required"),
    category: z.string().optional(),
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
    isCurrent: z.boolean().default(false),
});

// --- EXPERIENCE SCHEMA ---
export const experienceSchema = z.object({
    id: z.string().optional(),
    jobTitle: z.string().min(2, "Job title is required"),
    company: z.string().min(2, "Company name is required"),
    location: z.string().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    isCurrent: z.boolean().default(false),
    description: z.string().optional(),
    accomplishments: z.array(
        z.object({
            value: z.string().min(3, "Accomplishment must be at least 3 characters long"),
        })
    ).optional(),
});

export const educationSchema = z.object({
    institution: z.string().min(2, "Institution name is required"),
    degree: z.string().min(2, "Degree is required"),
    fieldOfStudy: z.string().min(2, "Field of study is required"),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()).optional(),
    isCurrent: z.boolean().default(false),
});

export const languageSchema = z.object({
    name: z.string().min(2, "Language name is required"),
    proficiency: z.string().min(2, "Proficiency level is required"),
});