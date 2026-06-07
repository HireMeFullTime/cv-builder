'use client';

import {useFieldArray, UseFormReturn} from 'react-hook-form';
import {TailoredCVData} from '@/types';
import {FormField, FormItem, FormControl, FormLabel} from '@/components/ui/form';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {ArrowUp, ArrowDown, Trash2, Plus} from 'lucide-react';

export function EditCVProjectAccomplishments({
	form,
	projIndex
}: {
	form: UseFormReturn<TailoredCVData>;
	projIndex: number;
}) {
	const {fields, append, remove, move} = useFieldArray({
		control: form.control,
		name: `projects.${projIndex}.accomplishments`
	});

	return (
		<div className='space-y-2 mt-2'>
			<FormLabel className='text-xs'>Accomplishments</FormLabel>
			<div className='flex flex-col gap-2'>
				{fields.map((field, idx) => (
					<div key={field.id} className='flex items-start gap-1'>
						<FormField
							control={form.control}
							name={`projects.${projIndex}.accomplishments.${idx}.value`}
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
								className='h-6 w-6'
								aria-label='Move accomplishment up'
								onClick={() => move(idx, idx - 1)}
								disabled={idx === 0}
							>
								<ArrowUp className='w-3 h-3' />
							</Button>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='h-6 w-6'
								aria-label='Move accomplishment down'
								onClick={() => move(idx, idx + 1)}
								disabled={idx === fields.length - 1}
							>
								<ArrowDown className='w-3 h-3' />
							</Button>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='h-6 w-6 text-destructive'
								aria-label='Remove accomplishment'
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
					onClick={() => append({value: ''})}
					className='w-fit text-[10px] h-6 px-2 mt-1'
				>
					<Plus className='w-3 h-3 mr-1' /> Add Point
				</Button>
			</div>
		</div>
	);
}
