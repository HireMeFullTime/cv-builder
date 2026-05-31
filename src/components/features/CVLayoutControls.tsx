'use client';

import {ColumnLayout, CVSectionId} from '@/types';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
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

interface SortableItemProps {
	id: CVSectionId;
}

function SortableItem({id}: SortableItemProps) {
	const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className='flex items-center gap-1.5 p-1.5 sm:p-2 mb-2 bg-background border rounded-md shadow-sm cursor-grab active:cursor-grabbing text-xs sm:text-sm font-medium min-w-0'
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
			<CardHeader className='p-4 pb-2'>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-base flex items-center gap-2'>
							<LayoutTemplate className='w-4 h-4' />
							Layout & Content Settings
						</CardTitle>
						<CardDescription className='text-xs'>Drag and drop sections to reorder or hide projects</CardDescription>
					</div>
					<div className='flex gap-2 items-center'>
						{layout.mode === 'two-column' && (
							<div className='flex flex-col gap-1 mr-4'>
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
									className='w-32 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-black'
									title='Adjust left column width'
								/>
							</div>
						)}
						<div className='flex gap-1'>
							<Button
								variant={layout.mode === 'single' ? 'default' : 'outline'}
								size='sm'
								onClick={() => onChange({...layout, mode: 'single'})}
								className='h-8 text-xs'
							>
								<LayoutTemplate className='w-3 h-3 mr-1.5' />1 Col
							</Button>
							<Button
								variant={layout.mode === 'two-column' ? 'default' : 'outline'}
								size='sm'
								onClick={() => onChange({...layout, mode: 'two-column'})}
								className='h-8 text-xs'
							>
								<Columns2 className='w-3 h-3 mr-1.5' />2 Cols
							</Button>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className='p-4 pt-2'>
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
		</Card>
	);
}
