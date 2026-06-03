import {useFieldArray} from 'react-hook-form';
import {EditSectionFormProps} from '@/types';
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {MonthYearPicker} from '@/components/features/MonthYearPicker';
import {ArrowUp, ArrowDown, Trash2, Plus} from 'lucide-react';

export function EditEducationSection({form}: EditSectionFormProps) {
	const {fields, append, remove, move} = useFieldArray({
		control: form.control,
		name: 'selectedEducations'
	});

	return (
		<div className='space-y-4'>
			<h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2'>Education</h3>
			<div className='space-y-6'>
				{fields.map((eduField, eduIndex) => (
					<div key={eduField.id} className='p-4 rounded-lg border bg-muted/10 space-y-4'>
						<div className='flex justify-between items-start'>
							<div className='flex-1 space-y-3 mr-4'>
								<FormField
									control={form.control}
									name={`selectedEducations.${eduIndex}.institution`}
									render={({field}) => (
										<FormItem>
											<FormLabel className='text-xs'>Institution</FormLabel>
											<FormControl>
												<Input {...field} className='h-8 text-sm' />
											</FormControl>
										</FormItem>
									)}
								/>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<FormField
										control={form.control}
										name={`selectedEducations.${eduIndex}.degree`}
										render={({field}) => (
											<FormItem>
												<FormLabel className='text-xs'>Degree</FormLabel>
												<FormControl>
													<Input {...field} className='h-8 text-sm' />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`selectedEducations.${eduIndex}.fieldOfStudy`}
										render={({field}) => (
											<FormItem>
												<FormLabel className='text-xs'>Field of Study</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ''} className='h-8 text-sm' />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name={`selectedEducations.${eduIndex}.isCurrent`}
									render={({field}) => (
										<FormItem className='flex flex-row items-center space-x-2 space-y-0'>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={checked => {
														field.onChange(checked);
														if (checked) {
															form.setValue(`selectedEducations.${eduIndex}.endDate`, '');
														}
													}}
												/>
											</FormControl>
											<FormLabel className='text-xs font-normal'>Present (I currently study here)</FormLabel>
										</FormItem>
									)}
								/>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4'>
									<FormField
										control={form.control}
										name={`selectedEducations.${eduIndex}.startDate`}
										render={({field}) => {
											const parseDateString = (val: string) => {
												if (!val) return undefined;
												const parts = val.split('-');
												if (parts.length >= 2)
													return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1));
												return new Date(val);
											};
											const formatDate = (date?: Date) => {
												if (!date) return '';
												return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
											};
											return (
												<FormItem className='space-y-1'>
													<FormLabel className='text-xs'>Start Date</FormLabel>
													<FormControl>
														<MonthYearPicker
															value={parseDateString(field.value || '')}
															onChange={date => field.onChange(formatDate(date))}
														/>
													</FormControl>
												</FormItem>
											);
										}}
									/>
									{!form.watch(`selectedEducations.${eduIndex}.isCurrent`) && (
										<FormField
											control={form.control}
											name={`selectedEducations.${eduIndex}.endDate`}
											render={({field}) => {
												const parseDateString = (val: string | null | undefined) => {
													if (!val) return undefined;
													const parts = val.split('-');
													if (parts.length >= 2)
														return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1));
													return new Date(val);
												};
												const formatDate = (date?: Date) => {
													if (!date) return '';
													return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
												};
												return (
													<FormItem className='space-y-1'>
														<FormLabel
															className={
																form.formState.errors.selectedEducations?.[eduIndex]?.endDate
																	? 'text-xs text-destructive'
																	: 'text-xs'
															}
														>
															End Date
														</FormLabel>
														<FormControl>
															<MonthYearPicker
																value={parseDateString(field.value || '')}
																onChange={date => field.onChange(formatDate(date))}
																minDate={parseDateString(form.watch(`selectedEducations.${eduIndex}.startDate`))}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												);
											}}
										/>
									)}
								</div>
								<FormField
									control={form.control}
									name={`selectedEducations.${eduIndex}.description`}
									render={({field}) => (
										<FormItem>
											<FormLabel className='text-xs'>Description (optional)</FormLabel>
											<FormControl>
												<Textarea {...field} value={field.value || ''} className='min-h-16 text-sm resize-y' />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className='flex flex-col gap-1'>
								<Button
									type='button'
									variant='secondary'
									size='icon'
									className='h-8 w-8'
									aria-label='Move education up'
									onClick={() => move(eduIndex, eduIndex - 1)}
									disabled={eduIndex === 0}
								>
									<ArrowUp className='w-4 h-4' />
								</Button>
								<Button
									type='button'
									variant='secondary'
									size='icon'
									className='h-8 w-8'
									aria-label='Move education down'
									onClick={() => move(eduIndex, eduIndex + 1)}
									disabled={eduIndex === fields.length - 1}
								>
									<ArrowDown className='w-4 h-4' />
								</Button>
								<Button
									type='button'
									variant='ghost'
									size='icon'
									className='h-8 w-8 text-destructive hover:bg-destructive/10'
									aria-label='Remove education'
									onClick={() => remove(eduIndex)}
								>
									<Trash2 className='w-4 h-4' />
								</Button>
							</div>
						</div>
					</div>
				))}
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() =>
						append({
							id: crypto.randomUUID(),
							institution: '',
							degree: '',
							fieldOfStudy: '',
							startDate: '',
							isCurrent: false,
							description: ''
						})
					}
					className='w-full border-dashed mt-2'
				>
					<Plus className='w-4 h-4 mr-2' /> Add Education
				</Button>
			</div>
		</div>
	);
}
