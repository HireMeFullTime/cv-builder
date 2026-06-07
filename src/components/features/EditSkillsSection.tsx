import {useFieldArray} from 'react-hook-form';
import {EditSectionControlProps} from '@/types';
import {FormField, FormItem, FormControl} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Trash2, Plus} from 'lucide-react';
import {SortableList, SortableItem, DragHandle} from '@/components/ui/sortable-list';
import {AccordionItem, AccordionTrigger, AccordionContent} from '@/components/ui/accordion';

export function EditSkillsSection({control}: EditSectionControlProps) {
	const {fields, append, remove, move} = useFieldArray({
		control,
		name: 'relevantSkills' as never // react-hook-form type workaround for string array
	});

	return (
		<AccordionItem value='skills' className='border-b-0'>
			<AccordionTrigger className='text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline pb-2'>
				Key Skills
			</AccordionTrigger>
			<AccordionContent className='space-y-2 pt-4'>
				<SortableList items={fields} onMove={move}>
					{fields.map((field, index) => (
						<SortableItem key={field.id} id={field.id} className='flex items-center gap-2'>
							<DragHandle />
							<FormField
								control={control}
								name={`relevantSkills.${index}`}
								render={({field: inputField}) => (
									<FormItem className='flex-1 mb-0 space-y-0'>
										<FormControl>
											<Input {...inputField} className='h-8 text-sm bg-background' />
										</FormControl>
									</FormItem>
								)}
							/>
							<div className='flex gap-1'>
								<Button
									type='button'
									variant='ghost'
									size='icon'
									className='h-8 w-8 text-destructive'
									aria-label='Remove skill'
									onClick={() => remove(index)}
								>
									<Trash2 className='w-4 h-4' />
								</Button>
							</div>
						</SortableItem>
					))}
				</SortableList>
				<Button type='button' variant='outline' size='sm' onClick={() => append('')} className='mt-2 text-xs h-8'>
					<Plus className='w-3 h-3 mr-1' /> Add Skill
				</Button>
			</AccordionContent>
		</AccordionItem>
	);
}
