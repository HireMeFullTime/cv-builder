'use client';

import {useForm, useFieldArray} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {experienceSchema} from '@/lib/validations';
import {type ExperienceData} from '@/types';
import {upsertExperience} from '@/actions/experience';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Checkbox} from '@/components/ui/checkbox';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {Trash2, PlusCircle, CheckCircle} from 'lucide-react';
import {MonthYearPicker} from './MonthYearPicker';

export function ExperienceForm({
	initialData,
	onClose,
	onSuccess
}: {
	initialData?: Partial<ExperienceData>;
	onClose?: () => void;
	onSuccess?: () => void;
}) {
	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();

	const form = useForm<ExperienceData>({
		resolver: zodResolver(experienceSchema),
		defaultValues: {
			id: initialData?.id || undefined,
			jobTitle: initialData?.jobTitle || '',
			company: initialData?.company || '',
			location: initialData?.location || '',
			startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
			endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
			isCurrent: initialData?.isCurrent || false,
			description: initialData?.description || '',
			accomplishments: initialData?.accomplishments || []
		}
	});

	const {fields, append, remove} = useFieldArray({
		name: 'accomplishments',
		control: form.control
	});

	const isCurrent = form.watch('isCurrent');

	async function onSubmit(data: ExperienceData) {
		setIsSaving(true);
		try {
			await upsertExperience(data);
			toast.success('Experience saved successfully!');
		} catch (error) {
			console.error('Error saving experience:', error);
			toast.error('Failed to save experience.');
			setIsSaving(false);
			return;
		}

		router.refresh();
		if (onSuccess) onSuccess();
		if (onClose) {
			form.reset();
			onClose();
		}
		setIsSaving(false);
	}

	return (
		<Card className='mb-6'>
			<CardHeader>
				<CardTitle>{initialData?.id ? 'Edit Experience' : 'Add New Experience'}</CardTitle>
				<CardDescription>Fill in the details about your past or current job.</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
						<div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
							<FormField
								control={form.control}
								name='jobTitle'
								render={({field}) => (
									<FormItem>
										<FormLabel>Job Title *</FormLabel>
										<FormControl>
											<Input placeholder='Frontend Developer' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='company'
								render={({field}) => (
									<FormItem>
										<FormLabel>Company *</FormLabel>
										<FormControl>
											<Input placeholder='Acme Corp' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name='location'
							render={({field}) => (
								<FormItem>
									<FormLabel>Location</FormLabel>
									<FormControl>
										<Input placeholder='Remote / New York' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
							<FormField
								control={form.control}
								name='startDate'
								render={({field}) => (
									<FormItem>
										<FormLabel>Start Date *</FormLabel>
										<FormControl>
											<MonthYearPicker value={field.value} onChange={field.onChange} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{!isCurrent && (
								<FormField
									control={form.control}
									name='endDate'
									render={({field}) => (
										<FormItem>
											<FormLabel>End Date</FormLabel>
											<FormControl>
												<MonthYearPicker value={field.value} onChange={field.onChange} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>

						<FormField
							control={form.control}
							name='isCurrent'
							render={({field}) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<div className='space-y-1 leading-none'>
										<FormLabel>I currently work here</FormLabel>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='description'
							render={({field}) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder='Briefly describe your responsibilities...'
											className='min-h-[100px]'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<FormLabel>Key Accomplishments / Responsibilities</FormLabel>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => append({value: ''})}
									className='h-8 flex items-center gap-1'
								>
									<PlusCircle className='w-4 h-4' /> Add
								</Button>
							</div>

							{fields.map((field, index) => (
								<FormField
									key={field.id}
									control={form.control}
									name={`accomplishments.${index}.value`}
									render={({field: inputField}) => (
										<FormItem className='flex items-center gap-2 space-y-0'>
											<FormControl>
												<Input placeholder='e.g. Increased page load speed by 30%...' {...inputField} />
											</FormControl>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												onClick={() => remove(index)}
												className='h-10 w-10 text-destructive shrink-0'
											>
												<Trash2 className='w-4 h-4' />
											</Button>
											<FormMessage />
										</FormItem>
									)}
								/>
							))}
							{fields.length === 0 && (
								<p className='text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md'>
									No accomplishments added. Click "Add" to list your achievements.
								</p>
							)}
						</div>

						<div className='flex justify-between items-center pt-4'>
							{onClose ? (
								<Button type='button' variant='ghost' onClick={onClose}>
									Cancel
								</Button>
							) : (
								<div />
							)}
							<Button type='submit' disabled={isSaving}>
								<CheckCircle className='w-4 h-4 mr-2' />
								{isSaving ? 'Saving...' : 'Save Experience'}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
