import {Skeleton} from '@/components/ui/skeleton';

export default function DashboardLoading() {
	return (
		<div className='mx-auto max-w-3xl w-full space-y-6'>
			<div className='flex flex-wrap justify-between items-center gap-4'>
				<div className='space-y-2'>
					<Skeleton className='h-9 w-40' />
					<Skeleton className='h-5 w-64' />
				</div>
				<Skeleton className='h-10 w-40' />
			</div>

			{/* Tabs Skeleton */}
			<div className='space-y-4'>
				{/* Tabs List */}
				<div className='flex gap-2 border-b border-border pb-px'>
					<Skeleton className='h-10 w-24 rounded-b-none' />
					<Skeleton className='h-10 w-24 rounded-b-none' />
					<Skeleton className='h-10 w-24 rounded-b-none' />
					<Skeleton className='h-10 w-24 rounded-b-none' />
				</div>

				{/* Tab Content Area */}
				<div className='p-6 border border-border rounded-xl shadow-sm bg-card space-y-6 mt-4'>
					<Skeleton className='h-8 w-48' />
					<div className='space-y-4'>
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
					</div>
				</div>
			</div>
		</div>
	);
}
