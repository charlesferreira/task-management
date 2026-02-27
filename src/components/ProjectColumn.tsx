import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Project, Task } from "../models/types";
import TaskItem from "./TaskItem";
import { TASK_ROW_DIVIDER_CLASS } from "./taskRowStyles";

type ProjectColumnProps = {
  project: Project;
  tasks: Task[];
  isUnassigned?: boolean;
  fillWidth?: boolean;
  activeCount: number;
  onToggleComplete: (taskId: string) => void;
  onOpenProjectDetails: (projectId: string | null) => void;
  onOpenTaskDetails: (taskId: string) => void;
  onQuickAddTask: (projectId: string | null) => void;
};

type SortableTaskCardProps = {
  task: Task;
  project: Project;
  onToggleComplete: (taskId: string) => void;
  onOpenTaskDetails: (taskId: string) => void;
};

const SortableTaskCard = ({
  task,
  project,
  onToggleComplete,
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
        styleVariant="row"
        showProjectBadge={false}
        showCompleteToggle
        onToggleComplete={onToggleComplete}
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
  fillWidth = false,
  activeCount,
  onToggleComplete,
  onOpenProjectDetails,
  onOpenTaskDetails,
  onQuickAddTask,
}: ProjectColumnProps) => {
  const droppableId = isUnassigned ? "drop:unassigned" : `drop:${project.id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: "column-drop", projectId: isUnassigned ? null : project.id },
  });

  const setCombinedRef = (element: HTMLDivElement | null) => {
    setNodeRef(element);
  };

  return (
    <div
      ref={setCombinedRef}
      className={`relative flex h-full min-h-0 items-start ${
        fillWidth ? "w-full" : "w-96 shrink-0"
      }`}
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
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onQuickAddTask(isUnassigned ? null : project.id);
            }}
            className="rounded-md p-1.5 text-slate-400 opacity-0 transition group-focus-within/column:opacity-100 group-hover/column:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={`Add task to ${project.name}`}
          >
            <Plus className="h-4 w-4" />
          </button>
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
              <div
                className={`flex max-h-[calc(100vh-18rem)] flex-col overflow-y-auto pr-1 transition-[padding] duration-200 ${TASK_ROW_DIVIDER_CLASS}`}
              >
                {tasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    project={project}
                    onToggleComplete={onToggleComplete}
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
