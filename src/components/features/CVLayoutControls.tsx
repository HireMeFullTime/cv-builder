'use client';

import {ColumnLayout, CVSectionId} from '@/types';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Label} from '@/components/ui/label';
import {Columns2, LayoutTemplate, GripVertical} from 'lucide-react';
import {
	DndContext,
	DragOverlay,
	closestCorners,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	useDroppable,
	DragStartEvent,
	DragOverEvent,
	DragEndEvent
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {useState} from 'react';

const SECTION_LABELS: Record<CVSectionId, string> = {
	summary: 'Summary',
	skills: 'Key Skills',
	experience: 'Experience',
	education: 'Education',
	projects: 'Projects',
	languages: 'Languages'
};
import {type SortableItemProps} from '@/types';
function SortableItem({id}: SortableItemProps) {
	const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});

	const style = {
		'--dnd-transform': CSS.Transform.toString(transform),
		'--dnd-transition': transition
	} as React.CSSProperties;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-1.5 p-1.5 sm:p-2 mb-2 bg-background border rounded-md shadow-sm cursor-grab active:cursor-grabbing text-xs sm:text-sm font-medium min-w-0 transform-(--dnd-transform) [transition:var(--dnd-transition)] ${isDragging ? 'opacity-50 z-50 relative' : ''}`}
			{...attributes}
			{...listeners}
		>
			<GripVertical className='w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0' />
			<span className='truncate'>{SECTION_LABELS[id]}</span>
		</div>
	);
}


function DroppableColumn({id, items, children}: {id: string; items: string[]; children: React.ReactNode}) {
	const {setNodeRef} = useDroppable({id});
	return (
		<SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
			<div ref={setNodeRef} className='min-h-12.5'>
				{children}
			</div>
		</SortableContext>
	);
}

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
	const [activeId, setActiveId] = useState<CVSectionId | null>(null);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 5
			}
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 150,
				tolerance: 10
			}
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as CVSectionId);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const {active, over} = event;
		if (!over) return;

		const activeId = active.id as CVSectionId;
		const overId = over.id as CVSectionId | 'leftColumn' | 'rightColumn';

		if (activeId === overId) return;

		const isActiveInLeft = layout.leftColumn.includes(activeId);
		const isOverInLeft = layout.leftColumn.includes(overId as CVSectionId) || overId === 'leftColumn';

		if (isActiveInLeft !== isOverInLeft) {
			// Moving across columns
			onChange({
				...layout,
				leftColumn: isActiveInLeft ? layout.leftColumn.filter(id => id !== activeId) : [...layout.leftColumn, activeId],
				rightColumn: isActiveInLeft
					? [...layout.rightColumn, activeId]
					: layout.rightColumn.filter(id => id !== activeId)
			});
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event;
		setActiveId(null);

		if (!over) return;

		const activeId = active.id as CVSectionId;
		const overId = over.id as CVSectionId | 'leftColumn' | 'rightColumn';

		const isActiveInLeft = layout.leftColumn.includes(activeId);
		const isOverInLeft = layout.leftColumn.includes(overId as CVSectionId) || overId === 'leftColumn';

		if (isActiveInLeft && isOverInLeft) {
			const oldIndex = layout.leftColumn.indexOf(activeId);
			const newIndex = layout.leftColumn.indexOf(overId as CVSectionId);
			if (oldIndex !== newIndex && newIndex !== -1) {
				onChange({
					...layout,
					leftColumn: arrayMove(layout.leftColumn, oldIndex, newIndex)
				});
			}
		} else if (!isActiveInLeft && !isOverInLeft) {
			const oldIndex = layout.rightColumn.indexOf(activeId);
			const newIndex = layout.rightColumn.indexOf(overId as CVSectionId);
			if (oldIndex !== newIndex && newIndex !== -1) {
				onChange({
					...layout,
					rightColumn: arrayMove(layout.rightColumn, oldIndex, newIndex)
				});
			}
		}
	};

	const toggleProjectVisibility = (projectId: string, isVisible: boolean) => {
		const currentHidden = layout.hiddenProjectIds || [];
		let newHidden: string[];

		if (isVisible) {
			newHidden = currentHidden.filter(id => id !== projectId);
		} else {
			newHidden = [...currentHidden, projectId];
		}

		onChange({
			...layout,
			hiddenProjectIds: newHidden
		});
	};

	const toggleExperienceVisibility = (expId: string, isVisible: boolean) => {
		const currentHidden = layout.hiddenExperienceIds || [];
		let newHidden: string[];

		if (isVisible) {
			newHidden = currentHidden.filter(id => id !== expId);
		} else {
			newHidden = [...currentHidden, expId];
		}

		onChange({
			...layout,
			hiddenExperienceIds: newHidden
		});
	};

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
						<TabsList className='grid w-45 grid-cols-2 h-8'>
							<TabsTrigger value='layout' className='text-xs'>Layout</TabsTrigger>
							<TabsTrigger value='theme' className='text-xs'>Design</TabsTrigger>
						</TabsList>
					</div>
				</CardHeader>

				<TabsContent value='layout' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
					<div className='p-4 pb-2'>
						<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4'>
							<div className='text-sm text-muted-foreground'>
								Drag and drop sections to reorder
							</div>
							<div className='flex flex-wrap items-center gap-4'>
								{layout.mode === 'two-column' && (
									<div className='flex flex-col gap-1.5 grow sm:grow-0 min-w-35'>
										<div className='flex items-center justify-between'>
											<span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
												Col Width: {layout.leftColumnWidth ?? 50}%
											</span>
										</div>
										<input
											type='range'
											min='20'
											max='80'
											step='5'
											value={layout.leftColumnWidth ?? 50}
											onChange={e => onChange({...layout, leftColumnWidth: Number(e.target.value)})}
											className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-black'
											title='Adjust left column width'
										/>
									</div>
								)}
								<div className='flex gap-1.5 w-full sm:w-auto'>
									<Button
										variant={layout.mode === 'single' ? 'default' : 'outline'}
										size='sm'
										onClick={() => onChange({...layout, mode: 'single'})}
										className='h-8 text-xs flex-1 sm:flex-none'
									>
										<LayoutTemplate className='w-3 h-3 mr-1.5' />1 Col
									</Button>
									<Button
										variant={layout.mode === 'two-column' ? 'default' : 'outline'}
										size='sm'
										onClick={() => onChange({...layout, mode: 'two-column'})}
										className='h-8 text-xs flex-1 sm:flex-none'
									>
										<Columns2 className='w-3 h-3 mr-1.5' />2 Cols
									</Button>
								</div>
							</div>
						</div>
					</div>

					<CardContent className='p-4 pt-0'>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCorners}
							onDragStart={handleDragStart}
							onDragOver={handleDragOver}
							onDragEnd={handleDragEnd}
						>
							<div className='grid grid-cols-2 gap-4'>
								<div
									className={`space-y-1 p-3 rounded-lg border bg-muted/10 ${layout.mode === 'single' ? 'col-span-2' : ''}`}
								>
									<h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
										{layout.mode === 'single' ? 'Main Content' : 'Left Column'}
									</h4>
									<DroppableColumn id='leftColumn' items={layout.leftColumn}>
										{layout.leftColumn.map(id => (
											<SortableItem key={id} id={id} />
										))}
									</DroppableColumn>
								</div>

								{layout.mode === 'two-column' && (
									<div className='space-y-1 p-3 rounded-lg border bg-muted/10'>
										<h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
											Right Column
										</h4>
										<DroppableColumn id='rightColumn' items={layout.rightColumn}>
											{layout.rightColumn.map(id => (
												<SortableItem key={id} id={id} />
											))}
										</DroppableColumn>
									</div>
								)}
							</div>

							<DragOverlay>
								{activeId ? (
									<div className='flex items-center gap-1.5 p-1.5 sm:p-2 bg-background border border-primary rounded-md shadow-lg text-xs sm:text-sm font-medium opacity-90 cursor-grabbing min-w-0'>
										<GripVertical className='w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0' />
										<span className='truncate'>{SECTION_LABELS[activeId]}</span>
									</div>
								) : null}
							</DragOverlay>
						</DndContext>

						{projects && projects.length > 0 && (
							<div className='mt-4 pt-4 border-t'>
								<h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
									Included Projects
						</h4>
						<div className='flex flex-wrap gap-4'>
							{projects.map(proj => {
								const isHidden = layout.hiddenProjectIds?.includes(proj.id) ?? false;
								return (
									<div key={proj.id} className='flex items-center space-x-2'>
										<Checkbox
											id={`proj-${proj.id}`}
											checked={!isHidden}
											onCheckedChange={checked => toggleProjectVisibility(proj.id, checked as boolean)}
										/>
										<label
											htmlFor={`proj-${proj.id}`}
											className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
										>
											{proj.title}
										</label>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{experiences && experiences.length > 0 && (
					<div className='mt-4 pt-4 border-t'>
						<h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
							Included Experiences
						</h4>
						<div className='flex flex-wrap gap-4'>
							{experiences.map(exp => {
								const isHidden = layout.hiddenExperienceIds?.includes(exp.id) ?? false;
								return (
									<div key={exp.id} className='flex items-center space-x-2'>
										<Checkbox
											id={`exp-${exp.id}`}
											checked={!isHidden}
											onCheckedChange={checked => toggleExperienceVisibility(exp.id, checked as boolean)}
										/>
										<label
											htmlFor={`exp-${exp.id}`}
											className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
										>
											{exp.company}
										</label>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</CardContent>
			</TabsContent>

			<TabsContent value='theme' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
				<CardContent className='p-6 space-y-6'>
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
						<div className='space-y-2'>
							<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Typography</Label>
							<Select
								value={layout.theme?.fontFamily || 'sans'}
								onValueChange={(v: any) => onChange({ ...layout, theme: { ...layout.theme!, fontFamily: v } })}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select Font' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='sans'>Modern (Sans-serif)</SelectItem>
									<SelectItem value='serif'>Classic (Serif)</SelectItem>
									<SelectItem value='mono'>Technical (Monospace)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Font Size</Label>
							<Select
								value={layout.theme?.fontSize || 'base'}
								onValueChange={(v: any) => onChange({ ...layout, theme: { ...layout.theme!, fontSize: v } })}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select Size' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='sm'>Small</SelectItem>
									<SelectItem value='base'>Normal</SelectItem>
									<SelectItem value='lg'>Large</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Item Spacing</Label>
							<Select
								value={layout.theme?.spacing || 'normal'}
								onValueChange={(v: any) => onChange({ ...layout, theme: { ...layout.theme!, spacing: v } })}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select Spacing' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='compact'>Compact</SelectItem>
									<SelectItem value='normal'>Normal</SelectItem>
									<SelectItem value='relaxed'>Relaxed</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8 mt-2'>
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Doc Padding</Label>
									<span className='text-xs text-muted-foreground'>{layout.theme?.documentMargins ?? 32}px</span>
								</div>
								<input
									type='range'
									min='12'
									max='64'
									step='4'
									value={layout.theme?.documentMargins ?? 32}
									onChange={(e) => onChange({ ...layout, theme: { ...layout.theme!, documentMargins: Number(e.target.value) } })}
									className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-black'
								/>
							</div>

							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Section Gap</Label>
									<span className='text-xs text-muted-foreground'>{layout.theme?.sectionSpacing ?? 24}px</span>
								</div>
								<input
									type='range'
									min='8'
									max='64'
									step='4'
									value={layout.theme?.sectionSpacing ?? 24}
									onChange={(e) => onChange({ ...layout, theme: { ...layout.theme!, sectionSpacing: Number(e.target.value) } })}
									className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-black'
								/>
							</div>

							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Column Gap</Label>
									<span className='text-xs text-muted-foreground'>{layout.theme?.columnSpacing ?? 24}px</span>
								</div>
								<input
									type='range'
									min='8'
									max='64'
									step='4'
									value={layout.theme?.columnSpacing ?? 24}
									onChange={(e) => onChange({ ...layout, theme: { ...layout.theme!, columnSpacing: Number(e.target.value) } })}
									className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-black'
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</TabsContent>
			</Tabs>
		</Card>
	);
}
