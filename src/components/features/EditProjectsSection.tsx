import {useFieldArray} from 'react-hook-form';
import {EditSectionFormProps} from '@/types';
import {FormField, FormItem, FormLabel, FormControl} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {EditCVProjectTechStack} from '@/components/features/EditCVProjectTechStack';
import {EditCVProjectAccomplishments} from '@/components/features/EditCVProjectAccomplishments';
import {Trash2, Plus} from 'lucide-react';
import {SortableList, SortableItem, DragHandle} from '@/components/ui/sortable-list';
import {AccordionItem, AccordionTrigger, AccordionContent} from '@/components/ui/accordion';

export function EditProjectsSection({form}: EditSectionFormProps) {
	const {fields, append, remove, move} = useFieldArray({
		control: form.control,
		name: 'projects'
	});

	return (
		<AccordionItem value='projects' className='border-b-0'>
			<AccordionTrigger className='text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline pb-2'>
				Projects
			</AccordionTrigger>
			<AccordionContent className='space-y-6 pt-4'>
				<SortableList items={fields} onMove={move}>
					{fields.map((projField, projIndex) => (
						<SortableItem key={projField.id} id={projField.id} className='p-4 rounded-lg border bg-muted/10 space-y-4'>
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
									<EditCVProjectTechStack form={form} projIndex={projIndex} />

									{/* Nested Accomplishments for this project */}
									<EditCVProjectAccomplishments form={form} projIndex={projIndex} />
								</div>

								<div className='flex flex-col gap-1'>
									<DragHandle className='h-8 w-8' />
									<Button
										type='button'
										variant='ghost'
										size='icon'
										className='h-8 w-8 text-destructive hover:bg-destructive/10'
										aria-label='Remove project'
										onClick={() => remove(projIndex)}
									>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
							</div>
						</SortableItem>
					))}
				</SortableList>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() =>
						append({
							id: crypto.randomUUID(),
							title: '',
							shortDescription: '',
							techStack: [],
							accomplishments: []
						})
					}
					className='w-full border-dashed mt-2'
				>
					<Plus className='w-4 h-4 mr-2' /> Add Project
				</Button>
			</AccordionContent>
		</AccordionItem>
	);
}
