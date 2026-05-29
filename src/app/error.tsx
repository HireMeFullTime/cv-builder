'use client';

import {useEffect} from 'react';
import Link from 'next/link';
import {Button, buttonVariants} from '@/components/ui/button';

export default function GlobalError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
	useEffect(() => {
		console.error('Global Error Boundary caught an error:', error);
	}, [error]);

	return (
		<div className='flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4'>
			<div className='flex flex-col items-center max-w-md text-center gap-6 p-8 border border-border rounded-xl shadow-sm bg-card text-card-foreground'>
				<div className='rounded-full bg-destructive/10 p-4 text-destructive'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='w-8 h-8'
					>
						<circle cx='12' cy='12' r='10' />
						<line x1='12' x2='12' y1='8' y2='12' />
						<line x1='12' x2='12.01' y1='16' y2='16' />
					</svg>
				</div>
				<h2 className='text-2xl font-bold tracking-tight'>Something went wrong!</h2>
				<p className='text-muted-foreground text-sm'>
					{error.message || 'We experienced an unexpected error. Please try again or return later.'}
				</p>
				<div className='flex gap-4 w-full mt-2'>
					<Button onClick={() => reset()} className='flex-1'>
						Try again
					</Button>
					<Link href='/' className={buttonVariants({variant: 'outline', className: 'flex-1'})}>
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
