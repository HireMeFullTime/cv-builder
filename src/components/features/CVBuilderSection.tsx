'use client';

import {useState, useEffect} from 'react';
import {Profile, Education, Language} from '@prisma/client';
import {generateTailoredCV, deleteTailoredCV} from '@/actions/cv';
import {CVPreview} from '@/components/features/CVPreview';
import {CVLayoutControls} from '@/components/features/CVLayoutControls';
import {EditTailoredCVForm} from '@/components/features/EditTailoredCVForm';
import {CVBuilderFormData, TailoredCVData, ColumnLayout, ParsedTailoredCV} from '@/types';
import {cvBuilderFormSchema} from '@/lib/validations';
import {Button} from '@/components/ui/button';
import {CVGeneratorForm} from './cv-builder/CVGeneratorForm';
import {CVHistoryList} from './cv-builder/CVHistoryList';
import {toast} from 'sonner';
import {ArrowLeft, Printer} from 'lucide-react';
import {useForm, useWatch} from 'react-hook-form';
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
		leftColumnWidth: 30,
		theme: {
			fontFamily: 'sans',
			fontSize: 'base',
			spacing: 'normal',
			documentMargins: 32,
			sectionSpacing: 24,
			columnSpacing: 24
		}
	});

	const router = useRouter();

	const form = useForm<CVBuilderFormData>({
		resolver: zodResolver(cvBuilderFormSchema),
		defaultValues: {
			jobTitle: '',
			jobDescription: '',
			useDemoData: false
		}
	});

	const useDemoData = useWatch({ control: form.control, name: 'useDemoData' });

	useEffect(() => {
		if (useDemoData) {
			if (!form.getValues('jobTitle')) {
				form.setValue('jobTitle', 'Senior Frontend Developer', { shouldValidate: true });
			}
			if (!form.getValues('jobDescription')) {
				form.setValue(
					'jobDescription',
					'We are looking for an experienced Senior Frontend Developer to join our team. You should have deep knowledge of React, Next.js, and TypeScript. Experience with building scalable SaaS applications and leading a small team of developers is highly desirable. We value clean code, testing, and modern UI/UX practices.',
					{ shouldValidate: true }
				);
			}
		}
	}, [useDemoData, form]);

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

	// Sync local cvs state when initialCVs prop changes from router.refresh() or revalidatePath
	useEffect(() => {
		setCvs(initialCVs);
		setSelectedCv(prev => {
			if (!prev) return null;
			const updated = initialCVs.find(cv => cv.id === prev.id);
			return updated || prev;
		});
	}, [initialCVs]);

	async function onSubmit(data: CVBuilderFormData) {
		setIsGenerating(true);
		try {
			const result = await generateTailoredCV(data.jobTitle, data.jobDescription, data.useDemoData);
			if (result.success) {
				toast.success('CV Generated Successfully!');
				form.reset();
				router.refresh();
			} else {
				toast.error(result.error || 'Failed to generate CV.');
			}
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
		toast.warning('Are you sure you want to delete this CV?', {
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
					} catch {
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
						<CVGeneratorForm
							form={form}
							onSubmit={onSubmit}
							isGenerating={isGenerating}
							profile={profile}
						/>
						<CVHistoryList
							cvs={cvs}
							onSelectCv={handleSelectCv}
							onDelete={handleDelete}
						/>
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
