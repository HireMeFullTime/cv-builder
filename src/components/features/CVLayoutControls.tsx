'use client';

import { ColumnLayout } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayoutTemplate } from 'lucide-react';

import { CVLayoutTab } from './CVLayoutTab';
import { CVVisibilityTab } from './CVVisibilityTab';
import { CVDesignTab } from './CVDesignTab';

export function CVLayoutControls({
	layout,
	onChange,
	projects,
	experiences
}: {
	layout: ColumnLayout;
	onChange: (newLayout: ColumnLayout) => void;
	projects?: {id: string; title: string}[];
	experiences?: {id: string; jobTitle: string; company: string}[];
}) {
	return (
		<Card className='print:hidden border-dashed bg-muted/30 shadow-none mb-4'>
			<Tabs defaultValue='layout' className='w-full'>
				<CardHeader className='p-4 pb-2 border-b border-dashed'>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle className='text-base flex items-center gap-2'>
								<LayoutTemplate className='w-4 h-4' />
								CV Personalization
							</CardTitle>
							<CardDescription className='text-xs'>Customize the structure and appearance</CardDescription>
						</div>
						<TabsList className='grid w-64 grid-cols-3 h-8'>
							<TabsTrigger value='layout' className='text-xs'>Layout</TabsTrigger>
							<TabsTrigger value='visibility' className='text-xs'>Visibility</TabsTrigger>
							<TabsTrigger value='theme' className='text-xs'>Design</TabsTrigger>
						</TabsList>
					</div>
				</CardHeader>

				<TabsContent value='layout' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
					<CVLayoutTab layout={layout} onChange={onChange} />
				</TabsContent>

				<TabsContent value='visibility' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
					<CVVisibilityTab layout={layout} onChange={onChange} projects={projects} experiences={experiences} />
				</TabsContent>

				<TabsContent value='theme' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
					<CVDesignTab layout={layout} onChange={onChange} />
				</TabsContent>
			</Tabs>
		</Card>
	);
}
