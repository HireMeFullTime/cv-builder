import {getProfile} from '@/actions/profile';
import {getExperiences} from '@/actions/experience';
import {getProjects} from '@/actions/project';
import {getEducations} from '@/actions/education';
import {getSkills} from '@/actions/skill';
import {getLanguages} from '@/actions/language';
import {DashboardTabs} from '@/components/features/DashboardTabs';

import Link from 'next/link';
import {buttonVariants} from '@/components/ui/button';
import {Sparkles} from 'lucide-react';
import {cn} from '@/lib/utils';

export default async function DashboardPage() {
	const [profile, experiences, projects, educations, skills, languages] = await Promise.all([
		getProfile(),
		getExperiences(),
		getProjects(),
		getEducations(),
		getSkills(),
		getLanguages()
	]);

	const safeProfile = profile
		? {
				...profile,
				title: profile.title ?? undefined,
				phone: profile.phone ?? undefined,
				location: profile.location ?? undefined,
				githubUrl: profile.githubUrl ?? undefined,
				linkedinUrl: profile.linkedinUrl ?? undefined,
				bio: profile.bio ?? undefined,
				gdprClause: profile.gdprClause ?? undefined
			}
		: null;

	const safeExperiences = experiences.map(exp => ({
		...exp,
		location: exp.location ?? undefined,
		endDate: exp.endDate ?? undefined,
		description: exp.description ?? undefined,
		linkUrl: exp.linkUrl ?? undefined,
		linkLabel: exp.linkLabel ?? undefined,
		accomplishments: exp.accomplishments ? (exp.accomplishments as {value: string}[]) : undefined
	}));

	return (
		<div className='mx-auto max-w-300 w-full space-y-6'>
			<div className='flex flex-wrap justify-between items-center gap-4'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
					<p className='text-muted-foreground'>Manage your professional profile and projects here.</p>
				</div>
				<Link href='/dashboard/cv-builder' className={cn(buttonVariants({variant: 'default'}), 'gap-2')}>
					<Sparkles className='w-4 h-4' />
					Build Tailored CV
				</Link>
			</div>

			<DashboardTabs
				profile={safeProfile}
				experiences={safeExperiences}
				projects={projects}
				educations={educations}
				skills={skills}
				languages={languages}
			/>
		</div>
	);
}
