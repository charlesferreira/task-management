import { useDroppable } from "@dnd-kit/core";
import { MoreVertical } from "lucide-react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import type { Project, Task } from "../models/types";
import TaskItem from "./TaskItem";

type ProjectColumnProps = {
  project: Project;
  tasks: Task[];
  isUnassigned?: boolean;
  activeCount: number;
  onDeleteProject?: (projectId: string) => void;
  onOpenProjectDetails: (projectId: string | null) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleTracking: (taskId: string) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskTitle: (taskId: string, title: string) => void;
  onOpenTaskDetails: (taskId: string) => void;
};

type SortableTaskCardProps = {
  task: Task;
  project: Project;
  onToggleComplete: (taskId: string) => void;
  onToggleTracking: (taskId: string) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskTitle: (taskId: string, title: string) => void;
  onOpenTaskDetails: (taskId: string) => void;
};

const SortableTaskCard = ({
  task,
  project,
  onToggleComplete,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
  onDeleteTask,
  onUpdateTaskTitle,
  onOpenTaskDetails,
}: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", projectId: task.projectId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-0" : ""}
    >
      <TaskItem
        task={task}
        project={project}
        isDragging={isDragging}
        showProjectBadge={false}
        onToggleComplete={onToggleComplete}
        onToggleTracking={onToggleTracking}
        isTaskTracking={isTaskTracking}
        getTaskLiveMinutes={getTaskLiveMinutes}
        onDelete={onDeleteTask}
        onUpdateTitle={onUpdateTaskTitle}
        onOpenDetails={onOpenTaskDetails}
        dragHandleProps={{
          attributes,
          listeners,
          setActivatorNodeRef,
        }}
      />
    </div>
  );
};

const ProjectColumn = ({
  project,
  tasks,
  isUnassigned = false,
  activeCount,
  onDeleteProject,
  onOpenProjectDetails,
  onToggleComplete,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
  onDeleteTask,
  onUpdateTaskTitle,
  onOpenTaskDetails,
}: ProjectColumnProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const droppableId = isUnassigned ? "drop:unassigned" : `drop:${project.id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: "column-drop", projectId: isUnassigned ? null : project.id },
  });

  const setCombinedRef = (element: HTMLDivElement | null) => {
    setNodeRef(element);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setIsMenuOpen(false);
    };
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, [isMenuOpen]);

  return (
    <div
      ref={setCombinedRef}
      className="relative flex h-full min-h-0 w-96 shrink-0 items-start"
    >
      <div
        className={`group/column relative flex max-h-full w-full flex-col gap-3 rounded-xl border border-slate-200/70 bg-white px-5 pt-5 pb-5 shadow-sm transition dark:border-slate-800/70 dark:bg-slate-900 ${
          isOver
            ? "border-sky-400 bg-sky-50/60 ring-1 ring-sky-400/35 dark:border-sky-300 dark:bg-sky-900/30 dark:ring-sky-300/35"
            : ""
        }`}
      >
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => onOpenProjectDetails(isUnassigned ? null : project.id)}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenProjectDetails(isUnassigned ? null : project.id);
                }
              }}
              className="flex min-w-0 items-center gap-2 text-left"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {project.name} ({activeCount})
              </h3>
            </div>
          </div>
          <div
            ref={menuRef}
            className="relative"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="rounded-md p-1.5 text-slate-400 opacity-0 transition group-focus-within/column:opacity-100 group-hover/column:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Project actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {isMenuOpen ? (
              <div className="absolute top-full right-0 z-20 mt-1 flex min-w-32 flex-col rounded-lg border border-slate-200/70 bg-white p-1 shadow-md dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenProjectDetails(isUnassigned ? null : project.id);
                  }}
                  className="rounded-md px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Edit
                </button>
                {!isUnassigned && onDeleteProject ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDeleteProject(project.id);
                    }}
                    className="rounded-md px-2 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <div
          className="min-h-0"
          onPointerDown={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest?.("[data-task-card]")) {
              event.stopPropagation();
            }
          }}
        >
          {tasks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200/70 bg-white px-3 py-5 text-center text-xs text-slate-500 dark:border-slate-800/70 dark:bg-slate-900 dark:text-slate-400">
              No tasks to show
            </p>
          ) : (
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex max-h-[calc(100vh-18rem)] flex-col gap-2.5 overflow-y-auto pr-1 transition-[padding] duration-200">
                {tasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    project={project}
                    onToggleComplete={onToggleComplete}
                    onToggleTracking={onToggleTracking}
                    isTaskTracking={isTaskTracking}
                    getTaskLiveMinutes={getTaskLiveMinutes}
                    onDeleteTask={onDeleteTask}
                    onUpdateTaskTitle={onUpdateTaskTitle}
                    onOpenTaskDetails={onOpenTaskDetails}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectColumn;
