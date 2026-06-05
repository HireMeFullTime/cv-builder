'use client';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {registerSchema} from '@/lib/validations';
import {z} from 'zod';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import Link from 'next/link';
import {registerUser} from '@/actions/auth';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';

export function RegisterForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: ''
		}
	});

	const onSubmit = async (data: z.infer<typeof registerSchema>) => {
		setIsLoading(true);

		try {
			const result = await registerUser(data);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success('Account created successfully! Please sign in.');
				router.push('/');
			}
		} catch {
			toast.error('Something went wrong.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='w-full flex flex-col gap-6'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 w-full'>
					<FormField
						control={form.control}
						name='name'
						render={({field}) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder='John Doe' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='email'
						render={({field}) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder='name@example.com' type='email' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='password'
						render={({field}) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input placeholder='••••••••' type='password' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='confirmPassword'
						render={({field}) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<Input placeholder='••••••••' type='password' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type='submit' className='w-full' disabled={isLoading}>
						{isLoading ? 'Creating account...' : 'Sign up'}
					</Button>
				</form>
			</Form>

			<div className='flex flex-col gap-4 text-center text-sm'>
				<p className='text-muted-foreground'>
					Already have an account?{' '}
					<Link href='/' className='text-primary hover:underline font-medium'>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
