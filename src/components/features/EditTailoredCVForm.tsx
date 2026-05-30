'use client';

import {useForm, useFieldArray, UseFormReturn} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {tailoredCVSchema} from '@/lib/validations';
import {TailoredCVData, ParsedTailoredCV} from '@/types';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {ArrowUp, ArrowDown, Trash2, Plus, Save, Undo2} from 'lucide-react';
import {useEffect} from 'react';
import {toast} from 'sonner';
import {updateTailoredCV} from '@/actions/cv';
import {Profile} from '@prisma/client';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export function EditTailoredCVForm({
	cv,
	profile,
	onUpdatePreview,
	onClose
}: {
	cv: ParsedTailoredCV;
	profile: Profile | null;
	onUpdatePreview: (data: TailoredCVData) => void;
	onClose: () => void;
}) {
	const generatedContent = cv.generatedContent || {};
	const form = useForm<TailoredCVData>({
		resolver: zodResolver(tailoredCVSchema),
		defaultValues: {
			jobTitleOverride: generatedContent.jobTitleOverride || cv.jobTitle,
			personalInfo: generatedContent.personalInfo || {
				firstName: profile?.firstName || '',
				lastName: profile?.lastName || '',
				title: profile?.title || '',
				email: profile?.email || '',
				phone: profile?.phone || '',
				location: profile?.location || '',
				linkedinUrl: profile?.linkedinUrl || '',
				githubUrl: profile?.githubUrl || ''
			},
			summary: generatedContent.summary || generatedContent.professionalSummary || '',
			relevantSkills: generatedContent.relevantSkills || [],
			selectedExperiences: generatedContent.selectedExperiences || [],
			projects: generatedContent.projects || generatedContent.selectedProjects || []
		}
	});

	const {
		fields: skillFields,
		append: appendSkill,
		remove: removeSkill,
		move: moveSkill
	} = useFieldArray({
		control: form.control,
		name: 'relevantSkills' as never // react-hook-form type workaround for string array
	});

	const {fields: projectFields, move: moveProject} = useFieldArray({
		control: form.control,
		name: 'projects'
	});

	// Watch for real-time preview
	useEffect(() => {
		const subscription = form.watch(value => {
			// Provide fallback defaults to avoid undefined errors in preview during edit
			const safeValue = {
				jobTitleOverride: value.jobTitleOverride,
				personalInfo: value.personalInfo,
				summary: value.summary || '',
				relevantSkills: value.relevantSkills || [],
				selectedExperiences: value.selectedExperiences || [],
				projects: value.projects || []
			};
			onUpdatePreview(safeValue as TailoredCVData);
		});
		return () => subscription.unsubscribe();
	}, [form, onUpdatePreview]);

	async function onSubmit(data: TailoredCVData) {
		try {
			await updateTailoredCV(cv.id, data);
			toast.success('CV Content saved successfully!');
		} catch (error) {
			console.error(error);
			toast.error('Failed to save CV content.');
		}
	}

	return (
		<Card className='flex flex-col h-full overflow-hidden border-primary/50 shadow-md'>
			<CardHeader className='bg-muted/30 pb-4 border-b'>
				<div className='flex justify-between items-center'>
					<div>
						<CardTitle>Edit CV Content</CardTitle>
						<CardDescription>Changes preview in real-time</CardDescription>
					</div>
					<Button variant='outline' size='sm' onClick={onClose}>
						<Undo2 className='w-4 h-4 mr-2' />
						Back
					</Button>
				</div>
			</CardHeader>
			<CardContent className='flex-1 overflow-y-auto p-4 space-y-6'>
				<Form {...form}>
					<form id='edit-cv-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						{/* CV Header */}
						<div className='space-y-4'>
							<h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2'>
								Header / Contact Info
							</h3>
							<div className='grid grid-cols-2 gap-4'>
								<FormField
									control={form.control}
									name='personalInfo.firstName'
									render={({field}) => (
										<FormItem>
											<FormLabel className='text-xs'>First Name</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='personalInfo.lastName'
									render={({field}) => (
										<FormItem>
											<FormLabel className='text-xs'>Last Name</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='jobTitleOverride'
									render={({field}) => (
										<FormItem className='col-span-2'>
											<FormLabel className='text-xs'>Job Title (Displayed under name)</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='personalInfo.email'
									render={({field}) => (
										<FormItem>
											<FormLabel className='text-xs'>Email</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='personalInfo.phone'
									render={({field}) => (
										<FormItem>
											<FormLabel className='text-xs'>Phone</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='personalInfo.location'
									render={({field}) => (
										<FormItem className='col-span-2'>
											<FormLabel className='text-xs'>Location</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='personalInfo.linkedinUrl'
									render={({field}) => (
										<FormItem>
											<FormLabel className='text-xs'>LinkedIn URL</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='personalInfo.githubUrl'
									render={({field}) => (
										<FormItem>
											<FormLabel className='text-xs'>GitHub URL</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Summary */}
						<div className='space-y-4'>
							<h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2'>
								Summary
							</h3>
							<FormField
								control={form.control}
								name='summary'
								render={({field}) => (
									<FormItem>
										<FormControl>
											<Textarea {...field} className='min-h-30 text-sm' />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Skills */}
						<div className='space-y-4'>
							<h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2'>
								Key Skills
							</h3>
							<div className='space-y-2'>
								{skillFields.map((field, index) => (
									<div key={field.id} className='flex items-center gap-2'>
										<FormField
											control={form.control}
											name={`relevantSkills.${index}`}
											render={({field: inputField}) => (
												<FormItem className='flex-1 mb-0 space-y-0'>
													<FormControl>
														<Input {...inputField} className='h-8 text-sm' />
													</FormControl>
												</FormItem>
											)}
										/>
										<div className='flex gap-1'>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												className='h-8 w-8'
												onClick={() => moveSkill(index, index - 1)}
												disabled={index === 0}
											>
												<ArrowUp className='w-4 h-4' />
											</Button>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												className='h-8 w-8'
												onClick={() => moveSkill(index, index + 1)}
												disabled={index === skillFields.length - 1}
											>
												<ArrowDown className='w-4 h-4' />
											</Button>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												className='h-8 w-8 text-destructive'
												onClick={() => removeSkill(index)}
											>
												<Trash2 className='w-4 h-4' />
											</Button>
										</div>
									</div>
								))}
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => appendSkill('')}
									className='mt-2 text-xs h-8'
								>
									<Plus className='w-3 h-3 mr-1' /> Add Skill
								</Button>
							</div>
						</div>

						{/* Projects */}
						<div className='space-y-4'>
							<h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2'>
								Projects
							</h3>
							<div className='space-y-6'>
								{projectFields.map((projField, projIndex) => (
									<div key={projField.id} className='p-4 rounded-lg border bg-muted/10 space-y-4'>
										<div className='flex justify-between items-start'>
											<div className='flex-1 space-y-3 mr-4'>
												<FormField
													control={form.control}
													name={`projects.${projIndex}.title`}
													render={({field}) => (
														<FormItem className='space-y-1'>
															<FormLabel className='text-xs'>Project Title</FormLabel>
															<FormControl>
																<Input {...field} className='h-8 font-semibold' />
															</FormControl>
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name={`projects.${projIndex}.shortDescription`}
													render={({field}) => (
														<FormItem className='space-y-1'>
															<FormLabel className='text-xs'>Short Description</FormLabel>
															<FormControl>
																<Textarea {...field} className='h-20 text-sm resize-none' />
															</FormControl>
														</FormItem>
													)}
												/>

												{/* Nested Tech Stack for this project */}
												<ProjectTechStack form={form} projIndex={projIndex} />
											</div>

											<div className='flex flex-col gap-1'>
												<Button
													type='button'
													variant='secondary'
													size='icon'
													className='h-8 w-8'
													onClick={() => moveProject(projIndex, projIndex - 1)}
													disabled={projIndex === 0}
												>
													<ArrowUp className='w-4 h-4' />
												</Button>
												<Button
													type='button'
													variant='secondary'
													size='icon'
													className='h-8 w-8'
													onClick={() => moveProject(projIndex, projIndex + 1)}
													disabled={projIndex === projectFields.length - 1}
												>
													<ArrowDown className='w-4 h-4' />
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</form>
				</Form>
			</CardContent>
			<div className='p-4 border-t bg-muted/30'>
				<Button type='submit' form='edit-cv-form' className='w-full'>
					<Save className='w-4 h-4 mr-2' />
					Save Changes
				</Button>
			</div>
		</Card>
	);
}

// Sub-component for nested field array
function ProjectTechStack({form, projIndex}: {form: UseFormReturn<TailoredCVData>; projIndex: number}) {
	const {fields, append, remove, move} = useFieldArray({
		control: form.control,
		name: `projects.${projIndex}.techStack` as never
	});

	return (
		<div className='space-y-2 mt-2'>
			<FormLabel className='text-xs'>Tech Stack</FormLabel>
			<div className='flex flex-col gap-2'>
				{fields.map((field, idx) => (
					<div key={field.id} className='flex items-center gap-1'>
						<FormField
							control={form.control}
							name={`projects.${projIndex}.techStack.${idx}`}
							render={({field: inputField}) => (
								<FormItem className='flex-1 mb-0 space-y-0'>
									<FormControl>
										<Input {...inputField} className='h-7 text-xs' />
									</FormControl>
								</FormItem>
							)}
						/>
						<div className='flex gap-1'>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='h-7 w-7'
								onClick={() => move(idx, idx - 1)}
								disabled={idx === 0}
							>
								<ArrowUp className='w-3 h-3' />
							</Button>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='h-7 w-7'
								onClick={() => move(idx, idx + 1)}
								disabled={idx === fields.length - 1}
							>
								<ArrowDown className='w-3 h-3' />
							</Button>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='h-7 w-7 text-destructive'
								onClick={() => remove(idx)}
							>
								<Trash2 className='w-3 h-3' />
							</Button>
						</div>
					</div>
				))}
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => append('')}
					className='w-fit text-[10px] h-6 px-2 mt-1'
				>
					<Plus className='w-3 h-3 mr-1' /> Add Tech
				</Button>
			</div>
		</div>
	);
}
