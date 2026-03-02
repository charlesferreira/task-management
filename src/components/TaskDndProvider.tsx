import { useState, type ReactNode } from "react";
import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

type TaskDndProviderProps = {
  children: ReactNode;
  onDragEnd: (activeId: string, overId: string) => void;
  onDragStart?: (activeId: string) => void;
  onDragOver?: (activeId: string, overId: string | null) => void;
  onDragCancel?: () => void;
  collisionDetection?: CollisionDetection;
  renderDragOverlay?: (activeId: string) => ReactNode;
};

const TaskDndProvider = ({
  children,
  onDragEnd,
  onDragStart,
  onDragOver,
  onDragCancel,
  collisionDetection = closestCenter,
  renderDragOverlay,
}: TaskDndProviderProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const nextActiveId = String(event.active.id);
    setActiveId(nextActiveId);
    onDragStart?.(nextActiveId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    onDragOver?.(
      String(event.active.id),
      event.over ? String(event.over.id) : null,
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    onDragOver?.(String(active.id), null);
    if (!over || active.id === over.id) return;
    onDragEnd(String(active.id), String(over.id));
  };

  const handleDragCancel = () => {
    const nextActiveId = activeId;
    setActiveId(null);
    onDragCancel?.();
    if (nextActiveId) {
      onDragOver?.(nextActiveId, null);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay>
        {activeId && renderDragOverlay ? renderDragOverlay(activeId) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskDndProvider;
