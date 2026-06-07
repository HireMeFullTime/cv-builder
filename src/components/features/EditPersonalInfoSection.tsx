import {EditSectionControlProps} from '@/types';
import {FormField, FormItem, FormLabel, FormControl} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {AccordionItem, AccordionTrigger, AccordionContent} from '@/components/ui/accordion';

export function EditPersonalInfoSection({control}: EditSectionControlProps) {
	return (
		<AccordionItem value='personal-info' className='border-b-0'>
			<AccordionTrigger className='text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline pb-2'>
				Header / Contact Info
			</AccordionTrigger>
			<AccordionContent className='space-y-4 pt-4'>
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					<FormField
						control={control}
						name='personalInfo.firstName'
						render={({field}) => (
							<FormItem>
								<FormLabel className='text-xs'>First Name</FormLabel>
								<FormControl>
									<Input {...field} className='h-8 text-sm' />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name='personalInfo.lastName'
						render={({field}) => (
							<FormItem>
								<FormLabel className='text-xs'>Last Name</FormLabel>
								<FormControl>
									<Input {...field} className='h-8 text-sm' />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name='jobTitleOverride'
						render={({field}) => (
							<FormItem className='col-span-2'>
								<FormLabel className='text-xs'>Job Title (Displayed under name)</FormLabel>
								<FormControl>
									<Input {...field} className='h-8 text-sm' />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name='personalInfo.email'
						render={({field}) => (
							<FormItem>
								<FormLabel className='text-xs'>Email</FormLabel>
								<FormControl>
									<Input {...field} className='h-8 text-sm' />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name='personalInfo.phone'
						render={({field}) => (
							<FormItem>
								<FormLabel className='text-xs'>Phone</FormLabel>
								<FormControl>
									<Input {...field} className='h-8 text-sm' />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name='personalInfo.location'
						render={({field}) => (
							<FormItem className='col-span-2'>
								<FormLabel className='text-xs'>Location</FormLabel>
								<FormControl>
									<Input {...field} className='h-8 text-sm' />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name='personalInfo.linkedinUrl'
						render={({field}) => (
							<FormItem>
								<FormLabel className='text-xs'>LinkedIn URL</FormLabel>
								<FormControl>
									<Input {...field} className='h-8 text-sm' />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name='personalInfo.githubUrl'
						render={({field}) => (
							<FormItem>
								<FormLabel className='text-xs'>GitHub URL</FormLabel>
								<FormControl>
									<Input {...field} className='h-8 text-sm' />
								</FormControl>
							</FormItem>
						)}
					/>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
