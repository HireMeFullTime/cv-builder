import { z } from "zod";
import {
    profileSchema,
    skillSchema,
    projectSchema,
    experienceSchema,
    loginSchema
} from "../lib/validations";

export type ProfileData = z.infer<typeof profileSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type LoginData = z.infer<typeof loginSchema>;
