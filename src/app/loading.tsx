import {Loader2} from 'lucide-react';

export default function GlobalLoading() {
	return (
		<main className='flex min-h-screen flex-col items-center justify-center bg-background text-foreground'>
			<div className='flex flex-col items-center gap-4 text-muted-foreground animate-pulse'>
				<Loader2 className='h-10 w-10 animate-spin text-primary' />
				<p className='text-sm font-medium tracking-wide uppercase'>Loading app...</p>
			</div>
		</main>
	);
}
