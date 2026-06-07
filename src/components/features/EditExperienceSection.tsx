import {useFieldArray} from 'react-hook-form';
import {EditSectionFormProps} from '@/types';
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {MonthYearPicker} from '@/components/features/MonthYearPicker';
import {EditCVExperienceAccomplishments} from '@/components/features/EditCVExperienceAccomplishments';
import {Trash2, Plus} from 'lucide-react';
import {parseDateString, formatDate} from '@/lib/utils';
import {SortableList, SortableItem, DragHandle} from '@/components/ui/sortable-list';
import {AccordionItem, AccordionTrigger, AccordionContent} from '@/components/ui/accordion';

export function EditExperienceSection({form}: EditSectionFormProps) {
	const {fields, append, remove, move} = useFieldArray({
		control: form.control,
		name: 'selectedExperiences'
	});

	return (
		<AccordionItem value='experience' className='border-b-0'>
			<AccordionTrigger className='text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline pb-2'>
				Experience
			</AccordionTrigger>
			<AccordionContent className='space-y-6 pt-4'>
				<SortableList items={fields} onMove={move}>
					{fields.map((expField, expIndex) => (
						<SortableItem key={expField.id} id={expField.id} className='p-4 rounded-lg border bg-muted/10 space-y-4'>
							<div className='flex justify-between items-start'>
								<div className='flex-1 space-y-3 mr-4'>
									<FormField
										control={form.control}
										name={`selectedExperiences.${expIndex}.jobTitle`}
										render={({field}) => (
											<FormItem className='space-y-1'>
												<FormLabel className='text-xs'>Job Title</FormLabel>
												<FormControl>
													<Input {...field} className='h-8 font-semibold' />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`selectedExperiences.${expIndex}.company`}
										render={({field}) => (
											<FormItem className='space-y-1'>
												<FormLabel className='text-xs'>Company</FormLabel>
												<FormControl>
													<Input {...field} className='h-8 text-sm' />
												</FormControl>
											</FormItem>
										)}
									/>
									<div className='space-y-3'>
										<FormField
											control={form.control}
											name={`selectedExperiences.${expIndex}.isCurrent`}
											render={({field}) => (
												<FormItem className='flex flex-row items-center space-x-2 space-y-0'>
													<FormControl>
														<Checkbox
															checked={field.value}
															onCheckedChange={checked => {
																field.onChange(checked);
																if (checked) {
																	form.setValue(`selectedExperiences.${expIndex}.endDate`, '');
																}
															}}
														/>
													</FormControl>
													<FormLabel className='text-xs font-normal'>Present (I currently work here)</FormLabel>
												</FormItem>
											)}
										/>
										<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4'>
											<FormField
												control={form.control}
												name={`selectedExperiences.${expIndex}.startDate`}
												render={({field}) => (
													<FormItem className='space-y-1'>
														<FormLabel className='text-xs'>Start Date</FormLabel>
														<FormControl>
															<MonthYearPicker
																value={parseDateString(field.value)}
																onChange={date => field.onChange(formatDate(date))}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
											{!form.watch(`selectedExperiences.${expIndex}.isCurrent`) && (
												<FormField
													control={form.control}
													name={`selectedExperiences.${expIndex}.endDate`}
													render={({field}) => (
														<FormItem className='space-y-1'>
															<FormLabel
																className={
																	form.formState.errors.selectedExperiences?.[expIndex]?.endDate
																		? 'text-xs text-destructive'
																		: 'text-xs'
																}
															>
																End Date
															</FormLabel>
															<FormControl>
																<MonthYearPicker
																	value={parseDateString(field.value)}
																	onChange={date => field.onChange(formatDate(date))}
																	minDate={parseDateString(form.watch(`selectedExperiences.${expIndex}.startDate`))}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
										</div>
									</div>

									{/* Nested Accomplishments for this experience */}
									<EditCVExperienceAccomplishments form={form} expIndex={expIndex} />
								</div>

								<div className='flex flex-col gap-1'>
									<DragHandle className='h-8 w-8' />
									<Button
										type='button'
										variant='ghost'
										size='icon'
										className='h-8 w-8 text-destructive hover:bg-destructive/10'
										aria-label='Remove experience'
										onClick={() => remove(expIndex)}
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
							jobTitle: '',
							company: '',
							location: null,
							startDate: '',
							isCurrent: false,
							accomplishments: []
						})
					}
					className='w-full border-dashed mt-2'
				>
					<Plus className='w-4 h-4 mr-2' /> Add Experience
				</Button>
			</AccordionContent>
		</AccordionItem>
	);
}
