import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { useState } from "react";
import type { Project, Task } from "../models/types";

type ProjectColumnProps = {
  project: Project;
  tasks: Task[];
  isUnassigned?: boolean;
  dragHandle?: ReactNode;
  onAddTask: (title: string, projectId: string | null) => void;
  onDeleteProject?: (projectId: string) => void;
  onReorderProjectTasks: (
    projectId: string | null,
    activeId: string,
    overId: string,
  ) => void;
};

type SortableTaskCardProps = {
  task: Task;
};

const SortableTaskCard = ({ task }: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className={`flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-[10px] text-slate-400 transition hover:text-slate-700 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          aria-label="Drag task"
          {...attributes}
          {...listeners}
        >
          ::
        </button>
        <span>{task.title}</span>
      </div>
    </div>
  );
};

const ProjectColumn = ({
  project,
  tasks,
  isUnassigned = false,
  dragHandle,
  onAddTask,
  onDeleteProject,
  onReorderProjectTasks,
}: ProjectColumnProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask(trimmed, isUnassigned ? null : project.id);
    setTitle("");
    setIsAdding(false);
  };

  return (
    <div className="flex min-h-[240px] flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragHandle}
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-sm font-semibold text-slate-900">
            {project.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {tasks.length}
          </span>
          {!isUnassigned && onDeleteProject ? (
            <button
              type="button"
              onClick={() => onDeleteProject(project.id)}
              className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase transition hover:text-rose-500"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-xs text-slate-500">
            No tasks yet
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              onReorderProjectTasks(
                isUnassigned ? null : project.id,
                String(active.id),
                String(over.id),
              );
            }}
          >
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {tasks.map((task) => (
                  <SortableTaskCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <div className="mt-auto">
        {isAdding ? (
          <div className="flex flex-col gap-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
                if (event.key === "Escape") {
                  setIsAdding(false);
                  setTitle("");
                }
              }}
              placeholder="Task title"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="min-w-max rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Add task
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setTitle("");
                }}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="min-w-max rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
          >
            Add task
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectColumn;
