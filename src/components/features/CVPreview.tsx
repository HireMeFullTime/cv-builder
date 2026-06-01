'use client';

import {TailoredCVData, ColumnLayout, CVSectionId} from '@/types';
import {Profile, Education, Language} from '@prisma/client';
import {MapPin, Mail, Phone, Link as LinkIcon, ExternalLink, Globe} from 'lucide-react';
import Link from 'next/link';

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

	const theme = currentLayout.theme || { fontFamily: 'sans', fontSize: 'base', spacing: 'normal' };
	const fontClass = theme.fontFamily === 'serif' ? 'font-serif' : theme.fontFamily === 'mono' ? 'font-mono' : 'font-sans';
	
	const getFontSizes = () => {
		switch (theme.fontSize) {
			case 'sm':
				return {
					'--cv-text-xs': '10px',
					'--cv-text-sm': '12px',
					'--cv-text-base': '14px',
					'--cv-text-lg': '16px',
					'--cv-text-xl': '18px',
					'--cv-text-4xl': '30px',
				} as React.CSSProperties;
			case 'lg':
				return {
					'--cv-text-xs': '14px',
					'--cv-text-sm': '16px',
					'--cv-text-base': '18px',
					'--cv-text-lg': '20px',
					'--cv-text-xl': '24px',
					'--cv-text-4xl': '40px',
				} as React.CSSProperties;
			case 'base':
			default:
				return {
					'--cv-text-xs': '12px',
					'--cv-text-sm': '14px',
					'--cv-text-base': '16px',
					'--cv-text-lg': '18px',
					'--cv-text-xl': '20px',
					'--cv-text-4xl': '36px',
				} as React.CSSProperties;
		}
	};
	
	const docPadding = theme.documentMargins ?? 32;
	const secSpacing = theme.sectionSpacing ?? 24;
	const colSpacing = theme.columnSpacing ?? 24;
	const titleMb = Math.max(8, Math.round(secSpacing * 0.4));
	
	const itemSpace = theme.spacing === 'compact' ? 'space-y-3' : theme.spacing === 'relaxed' ? 'space-y-6' : 'space-y-4';

	const renderSection = (id: CVSectionId) => {
		switch (id) {
			case 'summary': {
				const summaryContent = data.summary || data.professionalSummary;
				if (!summaryContent) return null;
				return (
					<section key='summary'>
						<h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb)'>Summary</h3>
						<p className='text-black leading-relaxed text-(length:--cv-text-sm) whitespace-pre-wrap'>{summaryContent}</p>
					</section>
				);
			}

			case 'skills':
				if (!data.relevantSkills || data.relevantSkills.length === 0) return null;
				return (
					<section key='skills'>
						<h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb)'>Key Skills</h3>
						<div className='text-(length:--cv-text-sm) font-bold text-black leading-relaxed'>
							{data.relevantSkills.join(' • ')}
						</div>
					</section>
				);

			case 'experience': {
				if (!data.selectedExperiences || data.selectedExperiences.length === 0) return null;
				const visibleExperiences = data.selectedExperiences.filter(exp => !currentLayout.hiddenExperienceIds?.includes(exp.id));
				if (visibleExperiences.length === 0) return null;

				return (
					<section key='experience'>
						<h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb)'>Experience</h3>
						<div className={itemSpace}>
							{visibleExperiences.map(exp => (
								<div key={exp.id}>
									<div className='flex justify-between items-baseline mb-1'>
										<h4 className='font-bold text-black'>{exp.jobTitle}</h4>
										<span className='text-(length:--cv-text-xs) font-bold text-black whitespace-nowrap'>
											{new Date(exp.startDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})} -
											{exp.isCurrent
												? ' Present'
												: exp.endDate
													? ` ${new Date(exp.endDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}`
													: ''}
										</span>
									</div>
									<div className='text-(length:--cv-text-sm) font-medium text-black mb-2'>
										{exp.company}
										{exp.location ? ` | ${exp.location}` : ''}
									</div>
									{exp.accomplishments && exp.accomplishments.length > 0 && (
										<ul className='list-disc list-outside ml-4 space-y-1 text-(length:--cv-text-sm) text-black'>
											{exp.accomplishments.map((acc, idx) => (
												<li key={idx} className='pl-1'>
													{acc.value}
												</li>
											))}
										</ul>
									)}
								</div>
							))}
						</div>
					</section>
				);
			}

			case 'education': {
				const educationList = data?.selectedEducations && data.selectedEducations.length > 0 ? data.selectedEducations : educations;
				if (!educationList || educationList.length === 0) return null;
				return (
					<section key='education'>
						<h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb)'>Education</h3>
						<div className={itemSpace}>
							{educationList.map(edu => (
								<div key={edu.id}>
									<div className='flex justify-between items-baseline mb-1'>
										<h4 className='font-bold text-black'>{edu.institution}</h4>
										<span className='text-(length:--cv-text-xs) font-bold text-black whitespace-nowrap'>
											{new Date(edu.startDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})} -
											{edu.isCurrent
												? ' Present'
												: edu.endDate
													? ` ${new Date(edu.endDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}`
													: ''}
										</span>
									</div>
									<div className='text-(length:--cv-text-sm) font-medium text-black'>
										{edu.degree}
										{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
									</div>
									{edu.description && (
										<p className='text-(length:--cv-text-sm) text-black mt-1.5 leading-relaxed'>{edu.description}</p>
									)}
								</div>
							))}
						</div>
					</section>
				);
			}

			case 'languages': {
				const languageList = data?.languages && data.languages.length > 0 ? data.languages : languages;
				if (!languageList || languageList.length === 0) return null;
				return (
					<section key='languages'>
						<h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb)'>Languages</h3>
						<div className='flex flex-col gap-1.5'>
							{languageList.map((lang: any) => (
								<div key={lang.id} className='text-(length:--cv-text-sm) text-black leading-snug wrap-break-word'>
									<span className='font-bold'>{lang.name}</span>
									{lang.proficiency && <span> – {lang.proficiency}</span>}
								</div>
							))}
						</div>
					</section>
				);
			}

			case 'projects': {
				const projectsContent = data.projects || data.selectedProjects || [];
				const visibleProjects =
					projectsContent.filter((proj: any) => !currentLayout.hiddenProjectIds?.includes(proj.id));
				if (visibleProjects.length === 0) return null;

				return (
					<section key='projects'>
						<h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb)'>Projects</h3>
						<div className={`grid grid-cols-1 ${itemSpace}`}>
							{visibleProjects.map(proj => (
								<div key={proj.id} className='break-inside-avoid'>
									<div className='flex justify-between items-baseline mb-1'>
										<h4 className='font-bold text-black flex items-center gap-2'>
											{proj.title}
											{proj.linkUrl && (
												<Link
													href={proj.linkUrl}
													target='_blank'
													rel='noreferrer'
													className='text-black hover:opacity-70 transition-opacity'
													title='Project Website'
													aria-label={`Visit project website for ${proj.title}`}
												>
													<Globe className='w-3.5 h-3.5' />
												</Link>
											)}
											{proj.githubUrl && (
												<Link
													href={proj.githubUrl}
													target='_blank'
													rel='noreferrer'
													className='text-black hover:opacity-70 transition-opacity'
													title='GitHub Repository'
													aria-label={`View GitHub repository for ${proj.title}`}
												>
													<ExternalLink className='w-3.5 h-3.5' />
												</Link>
											)}
										</h4>
										{proj.role && (
											<span className='text-(length:--cv-text-xs) font-bold text-black'>
												{proj.role}
											</span>
										)}
									</div>
									<p className='text-(length:--cv-text-sm) text-black mb-2 leading-relaxed'>{proj.shortDescription}</p>

									{proj.accomplishments && proj.accomplishments.length > 0 && (
										<ul className='list-disc list-outside ml-4 space-y-1 text-(length:--cv-text-sm) text-black mb-2'>
											{proj.accomplishments.map((acc, idx) => (
												<li key={idx} className='pl-1'>
													{acc.value}
												</li>
											))}
										</ul>
									)}

									{proj.techStack && proj.techStack.length > 0 && (
										<div className='text-(length:--cv-text-xs) font-bold text-black mt-2 leading-relaxed'>
											{proj.techStack.join(' • ')}
										</div>
									)}
								</div>
							))}
						</div>
					</section>
				);
			}

			default:
				return null;
		}
	};

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
			className={`flex flex-col min-h-full text-black bg-white shadow-lg print:shadow-none mx-auto w-full max-w-[210mm] print:w-full print:max-w-none p-(--doc-padding) ${fontClass}`}
		>
			{/* Header section with Personal Info */}
			<header className='border-b-2 border-black pb-4 mb-(--sec-spacing)'>
				<h1 className='text-(length:--cv-text-4xl) leading-none font-bold text-black tracking-tight uppercase'>
					{data?.personalInfo?.firstName || profile?.firstName} {data?.personalInfo?.lastName || profile?.lastName}
				</h1>
				<h2 className='text-(length:--cv-text-xl) font-medium text-black mt-2'>
					{data?.jobTitleOverride || jobTitle || data?.personalInfo?.title || profile?.title || 'Professional'}
				</h2>

				<div className='flex flex-wrap gap-x-4 gap-y-2 mt-4 text-(length:--cv-text-sm) text-black'>
					{(data?.personalInfo?.email || profile?.email) && (
						<div className='flex items-center gap-1.5'>
							<Mail className='w-4 h-4' />
							<Link href={`mailto:${data?.personalInfo?.email || profile?.email}`} className="hover:underline text-black">
								{data?.personalInfo?.email || profile?.email}
							</Link>
						</div>
					)}
					{(data?.personalInfo?.phone || profile?.phone) && (
						<div className='flex items-center gap-1.5'>
							<Phone className='w-4 h-4' />
							<Link href={`tel:${data?.personalInfo?.phone || profile?.phone}`} className="hover:underline text-black">
								{data?.personalInfo?.phone || profile?.phone}
							</Link>
						</div>
					)}
					{(data?.personalInfo?.location || profile?.location) && (
						<div className='flex items-center gap-1.5'>
							<MapPin className='w-4 h-4' />
							<span>{data?.personalInfo?.location || profile?.location}</span>
						</div>
					)}
					{(data?.personalInfo?.linkedinUrl || profile?.linkedinUrl) && (
						<div className='flex items-center gap-1.5'>
							<LinkIcon className='w-4 h-4' />
							<Link href={data?.personalInfo?.linkedinUrl || profile?.linkedinUrl || '#'} target="_blank" rel="noreferrer" className="hover:underline text-black">
								{(data?.personalInfo?.linkedinUrl || profile?.linkedinUrl || '').replace('https://www.', '').replace('https://', '')}
							</Link>
						</div>
					)}
					{(data?.personalInfo?.githubUrl || profile?.githubUrl) && (
						<div className='flex items-center gap-1.5'>
							<ExternalLink className='w-4 h-4' />
							<Link href={data?.personalInfo?.githubUrl || profile?.githubUrl || '#'} target="_blank" rel="noreferrer" className="hover:underline text-black">
								{(data?.personalInfo?.githubUrl || profile?.githubUrl || '').replace('https://', '')}
							</Link>
						</div>
					)}
				</div>
			</header>

			{/* Main Content */}
			<div className='flex-1 flex flex-col sm:flex-row gap-(--col-spacing)'>
				{currentLayout.mode === 'two-column' ? (
					<>
						<div
							className='flex flex-col w-(--left-col-width) gap-(--sec-spacing)'
						>
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

			{/* Footer / GDPR Clause */}
			{(data?.personalInfo?.gdprClause || profile?.gdprClause) && (
				<footer 
					className='border-t border-black text-[10px] text-black text-justify leading-tight mt-(--sec-spacing) pt-(--title-mb)'
				>
					{data?.personalInfo?.gdprClause || profile?.gdprClause}
				</footer>
			)}
		</div>
	);
}
