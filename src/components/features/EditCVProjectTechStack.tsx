'use client';

import {useFieldArray, UseFormReturn} from 'react-hook-form';
import {TailoredCVData} from '@/types';
import {FormField, FormItem, FormControl, FormLabel} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {ArrowUp, ArrowDown, Trash2, Plus} from 'lucide-react';

export function EditCVProjectTechStack({form, projIndex}: {form: UseFormReturn<TailoredCVData>; projIndex: number}) {
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
								aria-label='Move tech up'
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
								aria-label='Move tech down'
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
								aria-label='Remove tech'
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
