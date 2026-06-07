'use client';

import React, {useMemo, createContext, useContext} from 'react';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {GripVertical} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

interface SortableListProps {
	items: {id: string}[];
	onMove: (oldIndex: number, newIndex: number) => void;
	children: React.ReactNode;
}

export function SortableList({items, onMove, children}: SortableListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	const itemIds = useMemo(() => items.map(item => item.id), [items]);

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event;

		if (over && active.id !== over.id) {
			const oldIndex = itemIds.indexOf(active.id as string);
			const newIndex = itemIds.indexOf(over.id as string);

			if (oldIndex !== -1 && newIndex !== -1) {
				onMove(oldIndex, newIndex);
			}
		}
	};

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
				{children}
			</SortableContext>
		</DndContext>
	);
}

type SortableItemContextType = {
	attributes: ReturnType<typeof useSortable>['attributes'];
	listeners: ReturnType<typeof useSortable>['listeners'];
};

const SortableItemContext = createContext<SortableItemContextType | null>(null);

interface SortableItemProps {
	id: string;
	children: React.ReactNode;
	className?: string;
}

export function SortableItem({id, children, className}: SortableItemProps) {
	const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		...(isDragging ? {zIndex: 50, position: 'relative' as const} : {})
	};

	return (
		<div ref={setNodeRef} style={style} className={cn(className, isDragging && 'z-50 relative')}>
			<SortableItemContext.Provider value={{attributes, listeners}}>{children}</SortableItemContext.Provider>
		</div>
	);
}

export function DragHandle({className}: {className?: string}) {
	const context = useContext(SortableItemContext);
	if (!context) {
		throw new Error('DragHandle must be used within a SortableItem');
	}
	const {attributes, listeners} = context;

	return (
		<Button
			type='button'
			variant='ghost'
			size='icon'
			className={cn(
				'h-8 w-8 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none',
				className
			)}
			{...attributes}
			{...listeners}
		>
			<GripVertical className='w-4 h-4' />
		</Button>
	);
}
