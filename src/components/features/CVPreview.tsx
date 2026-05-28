'use client';

import {TailoredCVData, ColumnLayout, CVSectionId} from '@/types';
import {Profile, Education} from '@prisma/client';
import {MapPin, Mail, Phone, Link as LinkIcon, ExternalLink, Globe} from 'lucide-react';
import Link from 'next/link';

export function CVPreview({
	data,
	profile,
	jobTitle,
	educations,
	layout
}: {
	data: TailoredCVData;
	profile: Profile | null;
	jobTitle: string;
	educations?: Education[];
	layout?: ColumnLayout;
}) {
	const currentLayout = layout || {
		mode: 'single',
		leftColumn: ['summary', 'skills', 'experience', 'education', 'projects'],
		rightColumn: []
	};

	const renderSection = (id: CVSectionId) => {
		switch (id) {
			case 'summary':
				if (!data.professionalSummary) return null;
				return (
					<section key='summary'>
						<h3 className='text-lg font-bold uppercase tracking-wider text-black mb-3'>Professional Summary</h3>
						<p className='text-black leading-relaxed text-sm whitespace-pre-wrap'>{data.professionalSummary}</p>
					</section>
				);

			case 'skills':
				if (!data.relevantSkills || data.relevantSkills.length === 0) return null;
				return (
					<section key='skills'>
						<h3 className='text-lg font-bold uppercase tracking-wider text-black mb-3'>Key Skills</h3>
						<div className='text-sm font-bold text-black leading-relaxed'>
							{data.relevantSkills.join(' • ')}
						</div>
					</section>
				);

			case 'experience':
				if (!data.selectedExperiences || data.selectedExperiences.length === 0) return null;
				return (
					<section key='experience'>
						<h3 className='text-lg font-bold uppercase tracking-wider text-black mb-3'>Experience</h3>
						<div className='space-y-5'>
							{data.selectedExperiences.map(exp => (
								<div key={exp.id}>
									<div className='flex justify-between items-baseline mb-1'>
										<h4 className='font-bold text-black'>{exp.jobTitle}</h4>
										<span className='text-xs font-bold text-black whitespace-nowrap'>
											{new Date(exp.startDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})} -
											{exp.isCurrent
												? ' Present'
												: exp.endDate
													? ` ${new Date(exp.endDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}`
													: ''}
										</span>
									</div>
									<div className='text-sm font-medium text-black mb-2'>
										{exp.company}
										{exp.location ? ` | ${exp.location}` : ''}
									</div>
									{exp.accomplishments && exp.accomplishments.length > 0 && (
										<ul className='list-disc list-outside ml-4 space-y-1.5 text-sm text-black'>
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

			case 'education':
				if (!educations || educations.length === 0) return null;
				return (
					<section key='education'>
						<h3 className='text-lg font-bold uppercase tracking-wider text-black mb-3'>Education</h3>
						<div className='space-y-4'>
							{educations.map(edu => (
								<div key={edu.id}>
									<div className='flex justify-between items-baseline mb-1'>
										<h4 className='font-bold text-black'>{edu.institution}</h4>
										<span className='text-xs font-bold text-black whitespace-nowrap'>
											{new Date(edu.startDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})} -
											{edu.isCurrent
												? ' Present'
												: edu.endDate
													? ` ${new Date(edu.endDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}`
													: ''}
										</span>
									</div>
									<div className='text-sm font-medium text-black'>
										{edu.degree}
										{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
									</div>
									{edu.description && (
										<p className='text-sm text-black mt-1.5 leading-relaxed'>{edu.description}</p>
									)}
								</div>
							))}
						</div>
					</section>
				);

			case 'projects': {
				const visibleProjects =
					data.selectedProjects?.filter(proj => !currentLayout.hiddenProjectIds?.includes(proj.id)) || [];
				if (visibleProjects.length === 0) return null;

				return (
					<section key='projects'>
						<h3 className='text-lg font-bold uppercase tracking-wider text-black mb-3'>Selected Projects</h3>
						<div className='grid grid-cols-1 gap-5'>
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
												>
													<ExternalLink className='w-3.5 h-3.5' />
												</Link>
											)}
										</h4>
										{proj.role && (
											<span className='text-xs font-bold text-black'>
												{proj.role}
											</span>
										)}
									</div>
									<p className='text-sm text-black mb-2 leading-relaxed'>{proj.shortDescription}</p>

									{proj.accomplishments && proj.accomplishments.length > 0 && (
										<ul className='list-disc list-outside ml-4 space-y-1 text-sm text-black mb-2'>
											{proj.accomplishments.map((acc, idx) => (
												<li key={idx} className='pl-1'>
													{acc.value}
												</li>
											))}
										</ul>
									)}

									{proj.techStack && proj.techStack.length > 0 && (
										<div className='text-xs font-bold text-black mt-2 leading-relaxed'>
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

	return (
		<div className='flex flex-col min-h-full font-sans text-black bg-white'>
			{/* Header section with Personal Info */}
			<header className='mb-8 border-b-2 border-black pb-6'>
				<h1 className='text-4xl font-bold text-black tracking-tight uppercase'>
					{data?.personalInfo?.firstName || profile?.firstName} {data?.personalInfo?.lastName || profile?.lastName}
				</h1>
				<h2 className='text-xl font-medium text-black mt-2'>
					{data?.jobTitleOverride || jobTitle || data?.personalInfo?.title || profile?.title || 'Professional'}
				</h2>

				<div className='flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-black'>
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
			<div
				className={`flex-1 ${
					currentLayout.mode === 'two-column'
						? 'grid gap-8 print:gap-8'
						: 'space-y-8 print:space-y-6'
				}`}
				style={
					currentLayout.mode === 'two-column'
						? {gridTemplateColumns: `${currentLayout.leftColumnWidth ?? 50}fr ${100 - (currentLayout.leftColumnWidth ?? 50)}fr`}
						: undefined
				}
			>
				{currentLayout.mode === 'single' ? (
					<>{currentLayout.leftColumn.map(renderSection)}</>
				) : (
					<>
						<div className='space-y-8 print:space-y-6'>{currentLayout.leftColumn.map(renderSection)}</div>
						<div className='space-y-8 print:space-y-6'>{currentLayout.rightColumn.map(renderSection)}</div>
					</>
				)}
			</div>

			{/* Footer / GDPR Clause */}
			{profile?.gdprClause && (
				<footer className='mt-12 pt-6 border-t border-black text-[10px] text-black text-justify leading-tight'>
					{profile.gdprClause}
				</footer>
			)}
		</div>
	);
}
