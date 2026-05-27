import { z } from "zod";
import {
    profileSchema,
    skillSchema,
    projectSchema,
    experienceSchema,
    educationSchema,
    loginSchema
} from "../lib/validations";

export type ProfileData = z.infer<typeof profileSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
