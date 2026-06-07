'use client';

import {useFieldArray, UseFormReturn} from 'react-hook-form';
import {TailoredCVData} from '@/types';
import {FormField, FormItem, FormControl, FormLabel} from '@/components/ui/form';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Trash2, Plus} from 'lucide-react';
import {SortableList, SortableItem, DragHandle} from '@/components/ui/sortable-list';

export function EditCVExperienceAccomplishments({
	form,
	expIndex
}: {
	form: UseFormReturn<TailoredCVData>;
	expIndex: number;
}) {
	const {fields, append, remove, move} = useFieldArray({
		control: form.control,
		name: `selectedExperiences.${expIndex}.accomplishments`
	});

	return (
		<div className='space-y-2 mt-2'>
			<FormLabel className='text-xs'>Accomplishments</FormLabel>
			<div className='flex flex-col gap-2'>
				<SortableList items={fields} onMove={move}>
				{fields.map((field, idx) => (
					<SortableItem key={field.id} id={field.id} className='flex items-start gap-1'>
						<DragHandle className='h-6 w-6 mt-2' />
						<FormField
							control={form.control}
							name={`selectedExperiences.${expIndex}.accomplishments.${idx}.value`}
							render={({field: inputField}) => (
								<FormItem className='flex-1 mb-0 space-y-0'>
									<FormControl>
										<Textarea {...inputField} className='min-h-16 text-xs resize-none' />
									</FormControl>
								</FormItem>
							)}
						/>
						<div className='flex flex-col gap-1'>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='h-6 w-6 text-destructive mt-1'
								aria-label='Remove accomplishment'
								onClick={() => remove(idx)}
							>
								<Trash2 className='w-3 h-3' />
							</Button>
						</div>
					</SortableItem>
				))}
				</SortableList>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => append({value: ''})}
					className='w-fit text-[10px] h-6 px-2 mt-1'
				>
					<Plus className='w-3 h-3 mr-1' /> Add Point
				</Button>
			</div>
		</div>
	);
}
