'use client';

import {useState, useEffect} from 'react';
import {Profile, Education, Language} from '@prisma/client';
import {generateTailoredCV, deleteTailoredCV} from '@/actions/cv';
import {CVPreview} from '@/components/features/CVPreview';
import {CVLayoutControls} from '@/components/features/CVLayoutControls';
import {EditTailoredCVForm} from '@/components/features/EditTailoredCVForm';
import {CVBuilderFormData, TailoredCVData, ColumnLayout, ParsedTailoredCV} from '@/types';
import {cvBuilderFormSchema} from '@/lib/validations';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {toast} from 'sonner';
import {Loader2, Trash2, ArrowLeft, Printer, Sparkles} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';

export function CVBuilderSection({
	initialCVs,
	profile,
	educations,
	languages
}: {
	initialCVs: ParsedTailoredCV[];
	profile: Profile | null;
	educations: Education[];
	languages: Language[];
}) {
	const [cvs, setCvs] = useState<ParsedTailoredCV[]>(initialCVs);
	const [selectedCv, setSelectedCv] = useState<ParsedTailoredCV | null>(null);
	const [previewData, setPreviewData] = useState<TailoredCVData | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const [layout, setLayout] = useState<ColumnLayout>({
		mode: 'single',
		leftColumn: ['summary', 'skills', 'experience', 'education', 'languages', 'projects'],
		rightColumn: [],
		ratio: 'left-narrow',
		leftColumnWidth: 30
	});

	const router = useRouter();

	const form = useForm<CVBuilderFormData>({
		resolver: zodResolver(cvBuilderFormSchema),
		defaultValues: {
			jobTitle: '',
			jobDescription: ''
		}
	});

	// Keep previewData in sync with selectedCv when selectedCv changes
	useEffect(() => {
		if (selectedCv) {
			const data = { ...selectedCv.generatedContent };
			if (!data.selectedEducations && educations && educations.length > 0) {
				data.selectedEducations = educations.map(edu => ({
					id: edu.id,
					institution: edu.institution,
					degree: edu.degree,
					fieldOfStudy: edu.fieldOfStudy,
					startDate: edu.startDate.toISOString(),
					endDate: edu.endDate ? edu.endDate.toISOString() : null,
					isCurrent: edu.isCurrent,
					description: edu.description,
				}));
			}
			setPreviewData(data);
		} else {
			setPreviewData(null);
		}
	}, [selectedCv, educations]);

	// Sync local cvs state when initialCVs prop changes from router.refresh()
	useEffect(() => {
		setCvs(initialCVs);
	}, [initialCVs]);

	async function onSubmit(data: CVBuilderFormData) {
		setIsGenerating(true);
		try {
			await generateTailoredCV(data.jobTitle, data.jobDescription);
			toast.success('CV Generated Successfully!');

			form.reset();
			router.refresh();
		} catch (error) {
			console.error(error);
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to generate CV. Make sure your profile is complete.';
			toast.error(errorMessage);
		} finally {
			setIsGenerating(false);
		}
	}

	const handleDelete = (id: string) => {
		toast('Are you sure you want to delete this CV?', {
			action: {
				label: 'Delete',
				onClick: async () => {
					try {
						await deleteTailoredCV(id);
						setCvs(prev => prev.filter(cv => cv.id !== id));
						if (selectedCv?.id === id) {
							setSelectedCv(null);
						}
						toast.success('CV Deleted');
						router.refresh();
					} catch (error) {
						toast.error('Failed to delete CV');
					}
				}
			},
			cancel: {
				label: 'Cancel',
				onClick: () => {}
			}
		});
	};

	const handleSelectCv = (cv: ParsedTailoredCV) => {
		setSelectedCv(cv);
	};

	const displayData = previewData || selectedCv?.generatedContent;

	const renderSubmitButtonContent = () => {
		if (isGenerating) {
			return (
				<>
					<Loader2 className='mr-2 h-4 w-4 animate-spin' />
					Generating (Takes ~10-20s)
				</>
			);
		}
		if (!profile) return 'Profile Required';
		return 'Generate Tailored CV';
	};

	return (
		<div className='grid grid-cols-1 lg:grid-cols-12 gap-6 h-full'>
			{/* LEFT PANE: CONTROLS & FORM */}
			<div className='lg:col-span-4 space-y-6 flex flex-col h-full print:hidden'>
				{selectedCv ? (
					<EditTailoredCVForm
						cv={selectedCv}
						profile={profile}
						educations={educations}
						onUpdatePreview={setPreviewData}
						onClose={() => setSelectedCv(null)}
					/>
				) : (
					<>
						<Card>
							<CardHeader>
								<CardTitle>Target Role</CardTitle>
								<CardDescription>Paste the job details to generate a tailored CV.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4'>
									<Sparkles className='w-5 h-5 text-primary shrink-0 mt-0.5' />
									<div className='text-xs text-foreground space-y-1'>
										<p className='font-semibold'>AI-Powered CV Generation</p>
										<p className='opacity-90 leading-relaxed'>Our AI analyzes the job description and your profile data to automatically select the most relevant experience, skills, and projects. It also tailors descriptions and generates a professional summary matched to the role.</p>
									</div>
								</div>
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
										<FormField
											control={form.control}
											name='jobTitle'
											render={({field}) => (
												<FormItem>
													<FormLabel>Job Title</FormLabel>
													<FormControl>
														<Input placeholder='e.g. Senior Frontend Developer' disabled={isGenerating} {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='jobDescription'
											render={({field}) => (
												<FormItem>
													<FormLabel>Job Description</FormLabel>
													<FormControl>
														<Textarea
															placeholder='Paste the full job description here...'
															className='h-48 resize-none'
															disabled={isGenerating}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<Button type='submit' className='w-full' disabled={isGenerating || !profile}>
											{renderSubmitButtonContent()}
										</Button>
										{!profile && (
											<p className='text-sm text-destructive text-center mt-2'>
												You must complete your basic profile before generating a CV.
											</p>
										)}
										<p className='text-[11px] text-muted-foreground text-center mt-3'>
											Generated content is AI-assisted. You can review and edit all sections after generation.
										</p>
									</form>
								</Form>
							</CardContent>
						</Card>

						<Card className='flex-1 overflow-auto'>
							<CardHeader>
								<CardTitle>History</CardTitle>
								<CardDescription>Your previously generated CVs.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-3'>
								{cvs.length === 0 ? (
									<p className='text-sm text-muted-foreground text-center py-4'>No CVs generated yet.</p>
								) : (
									cvs.map(cv => (
										<div
											key={cv.id}
											className='flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50'
											onClick={() => handleSelectCv(cv)}
										>
											<div className='overflow-hidden'>
												<p className='font-medium truncate'>{cv.jobTitle}</p>
												<p className='text-xs text-muted-foreground'>
													{new Date(cv.createdAt).toLocaleDateString('en-US')}
												</p>
											</div>
											<Button
												variant='ghost'
												size='icon'
												className='text-destructive hover:bg-destructive/10 shrink-0 ml-2'
												aria-label='Delete CV'
												onClick={e => {
													e.stopPropagation();
													handleDelete(cv.id);
												}}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									))
								)}
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* RIGHT PANE: CV PREVIEW */}
			<div className='lg:col-span-8 bg-background border rounded-lg shadow-sm min-h-200 flex flex-col print:border-none print:shadow-none print:col-span-12'>
				{selectedCv ? (
					<>
						<div className='border-b p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20 print:hidden'>
							<div className='flex items-center gap-2 min-w-0'>
								<Button variant='ghost' size='sm' onClick={() => setSelectedCv(null)} className='lg:hidden shrink-0'>
									<ArrowLeft className='w-4 h-4 mr-1' /> Back
								</Button>
								<h3 className='font-semibold truncate'>Preview: {selectedCv.jobTitle}</h3>
							</div>
							<Button variant='outline' size='sm' onClick={() => window.print()} className='gap-2 w-full sm:w-auto shrink-0'>
								<Printer className='w-4 h-4' /> Print / Export PDF
							</Button>
						</div>
						<div className='p-8 md:p-12 print:p-0 flex-1 overflow-y-auto print:overflow-visible bg-white text-black print:bg-transparent'>
							<CVLayoutControls
								layout={layout}
								onChange={setLayout}
								projects={displayData?.projects || []}
								experiences={displayData?.selectedExperiences || []}
							/>
							<CVPreview
								data={displayData!}
								profile={profile}
								jobTitle={displayData?.jobTitleOverride || selectedCv.jobTitle}
								educations={educations}
								languages={languages}
								layout={layout}
							/>
						</div>
					</>
				) : (
					<div className='flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center print:hidden'>
						<div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
							<Printer className='w-8 h-8 opacity-50' />
						</div>
						<h3 className='text-xl font-semibold mb-2 text-foreground'>No CV Selected</h3>
						<p className='max-w-sm'>
							Select a previously generated CV from the history list, or paste a job description on the left to generate
							a new one.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
