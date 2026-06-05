'use client';

import {useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {tailoredCVSchema} from '@/lib/validations';
import {useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Form, FormField, FormItem, FormControl, FormMessage} from '@/components/ui/form';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Save, Undo2} from 'lucide-react';
import {toast} from 'sonner';
import {updateTailoredCV} from '@/actions/cv';

// Import newly extracted subcomponents
import {EditPersonalInfoSection} from './EditPersonalInfoSection';
import {EditSkillsSection} from './EditSkillsSection';
import {EditExperienceSection} from './EditExperienceSection';
import {EditEducationSection} from './EditEducationSection';
import {EditProjectsSection} from './EditProjectsSection';

import {TailoredCVData, EditTailoredCVFormProps} from '@/types';

export function EditTailoredCVForm({cv, profile, educations, onClose, onUpdatePreview}: EditTailoredCVFormProps) {
	const form = useForm<TailoredCVData>({
		resolver: zodResolver(tailoredCVSchema),
		defaultValues: {
			jobTitleOverride: cv.generatedContent.jobTitleOverride || cv.jobTitle || '',
			personalInfo: cv.generatedContent.personalInfo || {
				firstName: profile?.firstName || '',
				lastName: profile?.lastName || '',
				email: profile?.email || '',
				phone: profile?.phone || '',
				location: profile?.location || '',
				linkedinUrl: profile?.linkedinUrl || '',
				githubUrl: profile?.githubUrl || ''
			},
			summary: cv.generatedContent.summary || '',
			relevantSkills: cv.generatedContent.relevantSkills || [],
			selectedExperiences: cv.generatedContent.selectedExperiences || [],
			selectedEducations:
				cv.generatedContent.selectedEducations ||
				educations?.map(edu => ({
					id: edu.id,
					institution: edu.institution,
					degree: edu.degree,
					fieldOfStudy: edu.fieldOfStudy,
					startDate: edu.startDate.toISOString(),
					endDate: edu.endDate ? edu.endDate.toISOString() : null,
					isCurrent: edu.isCurrent,
					description: edu.description
				})) ||
				[],
			projects: cv.generatedContent.projects || []
		},
		mode: 'onChange'
	});

	const values = useWatch({ control: form.control });

	// Watch for real-time preview
	useEffect(() => {
		// Provide fallback defaults to avoid undefined errors in preview during edit
		const safeValue = {
			jobTitleOverride: values.jobTitleOverride,
			personalInfo: values.personalInfo,
			summary: values.summary || '',
			relevantSkills: values.relevantSkills || [],
			selectedExperiences: values.selectedExperiences || [],
			selectedEducations: values.selectedEducations || [],
			projects: values.projects || []
		};
		onUpdatePreview(safeValue as TailoredCVData);
	}, [values, onUpdatePreview]);

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
						<EditPersonalInfoSection control={form.control} />

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

						<EditSkillsSection control={form.control} />
						<EditExperienceSection form={form} />
						<EditEducationSection form={form} />
						<EditProjectsSection form={form} />
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
