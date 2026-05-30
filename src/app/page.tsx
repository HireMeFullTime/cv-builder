import {auth} from '@/auth';
import {LoginForm} from '@/components/features/LoginForm';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		redirect('/dashboard');
	}

	return (
		<main className='flex min-h-screen items-center justify-center bg-background text-foreground p-4'>
			<div className='flex flex-col items-center max-w-md w-full p-8 border border-border rounded-xl shadow-sm bg-card text-card-foreground gap-6'>
				<div className='flex flex-col gap-2'>
					<h1 className='text-3xl font-bold tracking-tight text-center'>CV & Portfolio Builder</h1>
					<p className='text-sm text-muted-foreground text-center px-4'>
						Tailored specifically for software developers and IT professionals.
					</p>
				</div>

				<div className='flex flex-col items-center gap-4 w-full'>
					<p className='text-muted-foreground text-center'>You are not logged in.</p>
					<Suspense fallback={<div className="w-full flex justify-center py-8 text-sm text-muted-foreground">Loading login form...</div>}>
						<LoginForm />
					</Suspense>
				</div>
			</div>
		</main>
	);
}
