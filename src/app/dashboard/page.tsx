import {getProfile} from '@/actions/profile';
import {getExperiences} from '@/actions/experience';
import {getProjects} from '@/actions/project';
import {DashboardTabs} from '@/components/features/DashboardTabs';

export default async function DashboardPage() {
	const profile = await getProfile();
	const experiences = await getExperiences();
	const projects = await getProjects();

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
		accomplishments: exp.accomplishments ? (exp.accomplishments as {value: string}[]) : undefined
	}));

	return (
		<div className='mx-auto max-w-[1200px] w-full space-y-6'>
			<div>
				<h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
				<p className='text-muted-foreground'>Manage your professional profile and projects here.</p>
			</div>

			<DashboardTabs profile={safeProfile} experiences={safeExperiences} projects={projects} />
		</div>
	);
}
