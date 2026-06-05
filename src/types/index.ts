import { z } from "zod";
import { TailoredCV } from "@prisma/client";
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
} from "@/lib/validations";

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

export type ParsedTailoredCV = Omit<TailoredCV, "generatedContent"> & {
  generatedContent: TailoredCVData;
};

export type LayoutMode = 'single' | 'two-column';
export type CVSectionId = 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'languages';
export type ColumnRatio = 'equal' | 'left-narrow' | 'right-narrow';

export interface ThemeSettings {
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'sm' | 'base' | 'lg';
  spacing: 'compact' | 'normal' | 'relaxed';
  documentMargins?: number;
  sectionSpacing?: number;
  columnSpacing?: number;
}

export interface ColumnLayout {
  mode: LayoutMode;
  leftColumn: CVSectionId[];
  rightColumn: CVSectionId[];
  ratio?: ColumnRatio;
  leftColumnWidth?: number;
  hiddenProjectIds?: string[];
  hiddenExperienceIds?: string[];
  theme?: ThemeSettings;
}

export interface SortableItemProps {
  id: CVSectionId;
}

export interface Accomplishment {
  value: string;
}

import { Control, UseFormReturn } from "react-hook-form";
import { Profile, Education, Language } from "@prisma/client";

export interface EditTailoredCVFormProps {
  cv: ParsedTailoredCV;
  profile?: Profile | null;
  educations?: Education[];
  onClose: () => void;
  onUpdatePreview: (data: TailoredCVData) => void;
}

export interface EditSectionControlProps {
  control: Control<TailoredCVData>;
}

export interface EditSectionFormProps {
  form: UseFormReturn<TailoredCVData>;
}

export interface CVDesignTabProps {
  layout: ColumnLayout;
  onChange: (newLayout: ColumnLayout) => void;
}

export interface CVLayoutTabProps {
  layout: ColumnLayout;
  onChange: (newLayout: ColumnLayout) => void;
}

export interface CVVisibilityTabProps {
  layout: ColumnLayout;
  onChange: (newLayout: ColumnLayout) => void;
  projects?: { id: string; title: string }[];
  experiences?: { id: string; jobTitle: string; company: string }[];
}

export interface CVGeneratorFormProps {
  form: UseFormReturn<CVBuilderFormData>;
  onSubmit: (data: CVBuilderFormData) => void;
  isGenerating: boolean;
  profile: Profile | null;
}

export interface CVHistoryListProps {
  cvs: ParsedTailoredCV[];
  onSelectCv: (cv: ParsedTailoredCV) => void;
  onDelete: (id: string) => void;
}

export interface CVPreviewEducationProps {
  selectedEducations?: TailoredCVData['selectedEducations'];
  educations?: Education[];
  itemSpace: string;
}

export interface CVPreviewExperienceProps {
  experiences?: TailoredCVData['selectedExperiences'];
  hiddenExperienceIds?: string[];
  itemSpace: string;
}

export interface CVPreviewFooterProps {
  personalInfo?: TailoredCVData['personalInfo'];
  profile: Profile | null;
}

export interface CVPreviewHeaderProps {
  personalInfo?: TailoredCVData['personalInfo'];
  profile: Profile | null;
  jobTitleOverride?: string;
  jobTitle: string;
}

export interface CVPreviewLanguagesProps {
  languagesData?: TailoredCVData['languages'];
  languages?: Language[];
}

export interface CVPreviewProjectsProps {
  projects?: TailoredCVData['projects'];
  selectedProjects?: TailoredCVData['selectedProjects'];
  hiddenProjectIds?: string[];
  itemSpace: string;
}

export interface CVPreviewSkillsProps {
  relevantSkills?: (string | null | undefined)[];
}

export interface CVPreviewSummaryProps {
  summary?: string;
  professionalSummary?: string;
}
