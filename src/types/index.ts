import { z } from "zod";
import {
  profileSchema,
  skillSchema,
  skillsFormSchema,
  projectSchema,
  experienceSchema,
  educationSchema,
  languageSchema,
  loginSchema,
  tailoredCVSchema,
  cvBuilderFormSchema
} from "../lib/validations";

export type ProfileData = z.infer<typeof profileSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type SkillsFormData = z.infer<typeof skillsFormSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type LanguageData = z.infer<typeof languageSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type TailoredCVData = z.infer<typeof tailoredCVSchema>;
export type CVBuilderFormData = z.infer<typeof cvBuilderFormSchema>;

export type LayoutMode = 'single' | 'two-column';
export type CVSectionId = 'summary' | 'skills' | 'experience' | 'projects' | 'education';
export type ColumnRatio = 'equal' | 'left-narrow' | 'right-narrow';

export interface ColumnLayout {
  mode: LayoutMode;
  leftColumn: CVSectionId[];
  rightColumn: CVSectionId[];
  ratio?: ColumnRatio;
  hiddenProjectIds?: string[];
}
