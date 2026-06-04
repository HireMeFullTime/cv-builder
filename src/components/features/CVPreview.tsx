'use client';

import {TailoredCVData, ColumnLayout, CVSectionId} from '@/types';
import {Profile, Education, Language} from '@prisma/client';
import {CVPreviewHeader} from './cv-preview/CVPreviewHeader';
import {CVPreviewSummary} from './cv-preview/CVPreviewSummary';
import {CVPreviewSkills} from './cv-preview/CVPreviewSkills';
import {CVPreviewExperience} from './cv-preview/CVPreviewExperience';
import {CVPreviewEducation} from './cv-preview/CVPreviewEducation';
import {CVPreviewLanguages} from './cv-preview/CVPreviewLanguages';
import {CVPreviewProjects} from './cv-preview/CVPreviewProjects';
import {CVPreviewFooter} from './cv-preview/CVPreviewFooter';

export function CVPreview({
	data,
	profile,
	jobTitle,
	educations,
	languages,
	layout
}: {
	data: TailoredCVData;
	profile: Profile | null;
	jobTitle: string;
	educations?: Education[];
	languages?: Language[];
	layout?: ColumnLayout;
}) {
	const currentLayout = layout || {
		mode: 'single',
		leftColumn: ['summary', 'skills', 'experience', 'education', 'languages', 'projects'],
		rightColumn: []
	};

	const theme = currentLayout.theme || {fontFamily: 'sans', fontSize: 'base', spacing: 'normal'};
	const fontClass =
		theme.fontFamily === 'serif' ? 'font-serif' : theme.fontFamily === 'mono' ? 'font-mono' : 'font-sans';

	const getFontSizes = () => {
		// Map the selected base font size to a set of CSS variables,
		// which define the typographic scale for the entire CV.
		switch (theme.fontSize) {
			case 'sm':
				return {
					'--cv-text-xs': '10px',
					'--cv-text-sm': '12px',
					'--cv-text-base': '14px',
					'--cv-text-lg': '16px',
					'--cv-text-xl': '18px',
					'--cv-text-4xl': '30px'
				} as React.CSSProperties;
			case 'lg':
				return {
					'--cv-text-xs': '14px',
					'--cv-text-sm': '16px',
					'--cv-text-base': '18px',
					'--cv-text-lg': '20px',
					'--cv-text-xl': '24px',
					'--cv-text-4xl': '40px'
				} as React.CSSProperties;
			case 'base':
			default:
				return {
					'--cv-text-xs': '12px',
					'--cv-text-sm': '14px',
					'--cv-text-base': '16px',
					'--cv-text-lg': '18px',
					'--cv-text-xl': '20px',
					'--cv-text-4xl': '36px'
				} as React.CSSProperties;
		}
	};

	// Retrieve the margins and spacing selected by the user (or defaults)
	const docPadding = theme.documentMargins ?? 32;
	const secSpacing = theme.sectionSpacing ?? 24;
	const colSpacing = theme.columnSpacing ?? 24;
	
	// Bottom margin for section titles calculated proportionally to the overall section spacing
	const titleMb = Math.max(8, Math.round(secSpacing * 0.4));

	// Translate the spacing theme into Tailwind classes for laying out list elements (e.g. experiences)
	const itemSpace = theme.spacing === 'compact' ? 'space-y-3' : theme.spacing === 'relaxed' ? 'space-y-6' : 'space-y-4';

	const renderSection = (id: CVSectionId) => {
		switch (id) {
			case 'summary':
				return (
					<CVPreviewSummary
						key='summary'
						summary={data.summary}
						professionalSummary={data.professionalSummary}
					/>
				);

			case 'skills':
				return (
					<CVPreviewSkills
						key='skills'
						relevantSkills={data.relevantSkills}
					/>
				);

			case 'experience':
				return (
					<CVPreviewExperience
						key='experience'
						experiences={data.selectedExperiences}
						hiddenExperienceIds={currentLayout.hiddenExperienceIds}
						itemSpace={itemSpace}
					/>
				);

			case 'education':
				return (
					<CVPreviewEducation
						key='education'
						selectedEducations={data.selectedEducations}
						educations={educations}
						itemSpace={itemSpace}
					/>
				);

			case 'languages':
				return (
					<CVPreviewLanguages
						key='languages'
						languagesData={data.languages}
						languages={languages}
					/>
				);

			case 'projects':
				return (
					<CVPreviewProjects
						key='projects'
						projects={data.projects}
						selectedProjects={data.selectedProjects}
						hiddenProjectIds={currentLayout.hiddenProjectIds}
						itemSpace={itemSpace}
					/>
				);

			default:
				return null;
		}
	};

	// Dynamic styles injected directly into the main container.
	// This allows full customization of the CV (e.g. margins) without having to recompile Tailwind.
	const dynamicStyles = {
		'--doc-padding': `${docPadding}px`,
		'--sec-spacing': `${secSpacing}px`,
		'--col-spacing': `${colSpacing}px`,
		'--title-mb': `${titleMb}px`,
		'--left-col-width': `${currentLayout.leftColumnWidth ?? 50}%`,
		...getFontSizes()
	} as React.CSSProperties;

	return (
		<div
			style={dynamicStyles}
			// We use box-decoration-clone so that when paginating in print (PDF)
			// padding and background are properly preserved. print:shadow-none disables shadow during PDF export.
			className={`flex flex-col min-h-full text-black bg-white shadow-lg print:shadow-none mx-auto w-full max-w-[210mm] print:w-full print:max-w-none p-(--doc-padding) box-decoration-clone ${fontClass}`}
		>
			<CVPreviewHeader
				personalInfo={data?.personalInfo}
				profile={profile}
				jobTitleOverride={data?.jobTitleOverride}
				jobTitle={jobTitle}
			/>

			{/* Main Content */}
			{/* Column structure depends on the selected mode: single or two-column */}
			<div className='flex-1 flex flex-col sm:flex-row gap-(--col-spacing)'>
				{currentLayout.mode === 'two-column' ? (
					<>
						<div className='flex flex-col w-(--left-col-width) gap-(--sec-spacing)'>
							{currentLayout.leftColumn.map(id => renderSection(id))}
						</div>
						<div className='flex flex-col flex-1 gap-(--sec-spacing)'>
							{currentLayout.rightColumn.map(id => renderSection(id))}
						</div>
					</>
				) : (
					<div className='flex flex-col w-full gap-(--sec-spacing)'>
						{currentLayout.leftColumn.map(id => renderSection(id))}
					</div>
				)}
			</div>

			<CVPreviewFooter
				personalInfo={data?.personalInfo}
				profile={profile}
			/>
		</div>
	);
}
