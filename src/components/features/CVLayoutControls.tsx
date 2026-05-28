"use client";

import { ColumnLayout, CVSectionId } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Columns2, LayoutTemplate, GripVertical } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

const SECTION_LABELS: Record<CVSectionId, string> = {
  summary: "Professional Summary",
  skills: "Key Skills",
  experience: "Experience",
  education: "Education",
  projects: "Selected Projects",
};

interface SortableItemProps {
  id: CVSectionId;
}

function SortableItem({ id }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 mb-2 bg-background border rounded-md shadow-sm cursor-grab active:cursor-grabbing text-sm font-medium"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      {SECTION_LABELS[id]}
    </div>
  );
}

import { useDroppable } from "@dnd-kit/core";

function DroppableColumn({ id, items, children }: { id: string, items: string[], children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="min-h-[50px]">
        {children}
      </div>
    </SortableContext>
  );
}

import { Checkbox } from "@/components/ui/checkbox";

export function CVLayoutControls({
  layout,
  onChange,
  projects,
}: {
  layout: ColumnLayout;
  onChange: (newLayout: ColumnLayout) => void;
  projects?: { id: string; title: string }[];
}) {
  const [activeId, setActiveId] = useState<CVSectionId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as CVSectionId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as CVSectionId;
    const overId = over.id as CVSectionId | "leftColumn" | "rightColumn";

    if (activeId === overId) return;

    const isActiveInLeft = layout.leftColumn.includes(activeId);
    const isOverInLeft = layout.leftColumn.includes(overId as any) || overId === "leftColumn";

    if (isActiveInLeft !== isOverInLeft) {
      // Moving across columns
      onChange({
        ...layout,
        leftColumn: isActiveInLeft
          ? layout.leftColumn.filter((id) => id !== activeId)
          : [...layout.leftColumn, activeId],
        rightColumn: isActiveInLeft
          ? [...layout.rightColumn, activeId]
          : layout.rightColumn.filter((id) => id !== activeId),
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as CVSectionId;
    const overId = over.id as CVSectionId | "leftColumn" | "rightColumn";

    const isActiveInLeft = layout.leftColumn.includes(activeId);
    const isOverInLeft = layout.leftColumn.includes(overId as any) || overId === "leftColumn";

    if (isActiveInLeft && isOverInLeft) {
      const oldIndex = layout.leftColumn.indexOf(activeId);
      const newIndex = layout.leftColumn.indexOf(overId as CVSectionId);
      if (oldIndex !== newIndex && newIndex !== -1) {
        onChange({
          ...layout,
          leftColumn: arrayMove(layout.leftColumn, oldIndex, newIndex),
        });
      }
    } else if (!isActiveInLeft && !isOverInLeft) {
      const oldIndex = layout.rightColumn.indexOf(activeId);
      const newIndex = layout.rightColumn.indexOf(overId as CVSectionId);
      if (oldIndex !== newIndex && newIndex !== -1) {
        onChange({
          ...layout,
          rightColumn: arrayMove(layout.rightColumn, oldIndex, newIndex),
        });
      }
    }
  };

  const toggleProjectVisibility = (projectId: string, isChecked: boolean) => {
    const currentHidden = layout.hiddenProjectIds || [];
    onChange({
      ...layout,
      hiddenProjectIds: isChecked
        ? currentHidden.filter(id => id !== projectId)
        : [...currentHidden, projectId]
    });
  };

  return (
    <Card className="print:hidden border-dashed bg-muted/30 shadow-none mb-4">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Layout & Content Settings
            </CardTitle>
            <CardDescription className="text-xs">Drag and drop sections to reorder or hide projects</CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            {layout.mode === "two-column" && (
              <div className="flex bg-muted p-0.5 rounded-md border mr-2">
                <Button
                  variant={layout.ratio === "left-narrow" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onChange({ ...layout, ratio: "left-narrow" })}
                  className="h-6 text-[10px] px-2"
                  title="Narrow Left Column (1:2.5)"
                >
                  1:2
                </Button>
                <Button
                  variant={layout.ratio === "equal" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onChange({ ...layout, ratio: "equal" })}
                  className="h-6 text-[10px] px-2"
                  title="Equal Columns (1:1)"
                >
                  1:1
                </Button>
                <Button
                  variant={layout.ratio === "right-narrow" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onChange({ ...layout, ratio: "right-narrow" })}
                  className="h-6 text-[10px] px-2"
                  title="Narrow Right Column (2.5:1)"
                >
                  2:1
                </Button>
              </div>
            )}
            <div className="flex gap-1">
              <Button
                variant={layout.mode === "single" ? "default" : "outline"}
                size="sm"
                onClick={() => onChange({ ...layout, mode: "single" })}
                className="h-8 text-xs"
              >
                <LayoutTemplate className="w-3 h-3 mr-1.5" />
                1 Col
              </Button>
              <Button
                variant={layout.mode === "two-column" ? "default" : "outline"}
                size="sm"
                onClick={() => onChange({ ...layout, mode: "two-column" })}
                className="h-8 text-xs"
              >
                <Columns2 className="w-3 h-3 mr-1.5" />
                2 Cols
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className={`space-y-1 p-3 rounded-lg border bg-muted/10 ${layout.mode === 'single' ? 'col-span-2' : ''}`}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {layout.mode === 'single' ? 'Main Content' : 'Left Column'}
              </h4>
              <DroppableColumn id="leftColumn" items={layout.leftColumn}>
                {layout.leftColumn.map((id) => (
                  <SortableItem key={id} id={id} />
                ))}
              </DroppableColumn>
            </div>

            {layout.mode === "two-column" && (
              <div className="space-y-1 p-3 rounded-lg border bg-muted/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Right Column</h4>
                <DroppableColumn id="rightColumn" items={layout.rightColumn}>
                  {layout.rightColumn.map((id) => (
                    <SortableItem key={id} id={id} />
                  ))}
                </DroppableColumn>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="flex items-center gap-2 p-2 bg-background border border-primary rounded-md shadow-lg text-sm font-medium opacity-90 cursor-grabbing">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                {SECTION_LABELS[activeId]}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {projects && projects.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Included Projects</h4>
            <div className="flex flex-wrap gap-4">
              {projects.map((proj) => {
                const isHidden = layout.hiddenProjectIds?.includes(proj.id) ?? false;
                return (
                  <div key={proj.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`proj-${proj.id}`} 
                      checked={!isHidden} 
                      onCheckedChange={(checked) => toggleProjectVisibility(proj.id, checked as boolean)} 
                    />
                    <label 
                      htmlFor={`proj-${proj.id}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {proj.title}
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
