import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { useSortableTask } from "../hooks/useSortableTask";
import type { Project, Task } from "../models/types";
import SortableTaskList from "./SortableTaskList";
import TaskItem from "./TaskItem";
import { TASK_ROW_DIVIDER_CLASS } from "./taskRowStyles";

type ProjectColumnProps = {
  project: Project;
  tasks: Task[];
  isUnassigned?: boolean;
  fillWidth?: boolean;
  activeCount: number;
  dropId: string;
  sortableId: string;
  onToggleComplete: (taskId: string) => void;
  onOpenProjectDetails: (projectId: string | null) => void;
  onOpenTaskDetails: (taskId: string) => void;
  onQuickAddTask: (projectId: string | null) => void;
  dropIndicatorIndex?: number | null;
  suppressShellDropState?: boolean;
};

type SortableProjectTaskRowProps = {
  task: Task;
  project: Project;
  onToggleComplete: (taskId: string) => void;
  onOpenTaskDetails: (taskId: string) => void;
};

const SortableProjectTaskRow = ({
  task,
  project,
  onToggleComplete,
  onOpenTaskDetails,
}: SortableProjectTaskRowProps) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    isDragging,
    style,
  } = useSortableTask(task.id);

  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        project={project}
        isDragging={isDragging}
        styleVariant="row"
        showProjectBadge={false}
        showCompleteToggle
        dragHandleProps={{
          attributes,
          listeners,
          setActivatorNodeRef,
        }}
        onToggleComplete={onToggleComplete}
        onOpenDetails={onOpenTaskDetails}
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
  dropId,
  sortableId,
  onToggleComplete,
  onOpenProjectDetails,
  onOpenTaskDetails,
  onQuickAddTask,
  dropIndicatorIndex = null,
  suppressShellDropState = false,
}: ProjectColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: dropId });
  const {
    attributes: projectAttributes,
    listeners: projectListeners,
    setActivatorNodeRef: setProjectActivatorNodeRef,
    setNodeRef: setProjectNodeRef,
    transform: projectTransform,
    transition: projectTransition,
    isDragging: isProjectDragging,
  } = useSortable({ id: sortableId });
  const shouldRenderDropIndicator = dropIndicatorIndex !== null;
  const isShellDropActive = isOver && !suppressShellDropState;
  const collapseProjectPlaceholder = isProjectDragging && fillWidth;
  const resolvedProjectTransform = isProjectDragging ? null : projectTransform;
  const translateOnlyTransform = resolvedProjectTransform
    ? `translate3d(${Math.round(resolvedProjectTransform.x)}px, ${Math.round(
        resolvedProjectTransform.y,
      )}px, 0)`
    : undefined;
  const projectStyle = {
    transform: translateOnlyTransform,
    transition: projectTransition,
  };

  return (
    <div
      ref={setProjectNodeRef}
      style={projectStyle}
      className={`relative flex h-full min-h-0 items-stretch ${
        fillWidth ? "h-auto w-full self-start" : "w-96 shrink-0"
      } ${
        collapseProjectPlaceholder
          ? "h-0 min-h-0 overflow-hidden opacity-0 pointer-events-none"
          : isProjectDragging
            ? "opacity-0"
            : ""
      }`}
    >
      <div
        className={`group/column relative flex min-h-0 max-h-full w-full flex-col gap-3 rounded-xl border border-slate-200/70 bg-white px-5 pt-5 pb-5 shadow-sm transition dark:border-slate-800/70 dark:bg-slate-900 ${
          fillWidth ? "h-auto" : "h-full"
        } ${collapseProjectPlaceholder ? "hidden" : ""}`}
      >
        <div
          ref={setProjectActivatorNodeRef}
          {...projectAttributes}
          {...projectListeners}
          className="flex cursor-grab items-center justify-between active:cursor-grabbing"
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
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label={`Add task to ${project.name}`}
          >
            <Plus className="h-4 w-4" />
            <span>Add task</span>
          </button>
        </div>
        <div className="flex h-full min-h-0 flex-1 flex-col">
          {tasks.length === 0 ? (
            <div
              ref={setNodeRef}
              className={`flex h-full min-h-32 flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-5 text-center text-sm transition-colors ${
                isShellDropActive
                  ? "border-sky-400/70 bg-sky-50 text-sky-700 dark:border-sky-500/60 dark:bg-sky-950/30 dark:text-sky-300"
                  : "border-slate-200/70 bg-white text-slate-500 dark:border-slate-800/70 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              No tasks to show
            </div>
          ) : (
            <div
              ref={setNodeRef}
              className={`flex h-full min-h-32 flex-1 flex-col rounded-lg transition-colors ${
                isShellDropActive
                  ? "bg-sky-50/50 dark:bg-sky-950/20"
                  : ""
              }`}
            >
              <SortableTaskList taskIds={tasks.map((task) => task.id)}>
                <div
                  className={`flex max-h-[calc(100vh-18rem)] min-h-0 flex-1 flex-col overflow-y-auto pr-1 transition-[padding] duration-200 ${TASK_ROW_DIVIDER_CLASS}`}
                >
                  {tasks.map((task, index) => (
                    <div key={task.id}>
                      {shouldRenderDropIndicator && dropIndicatorIndex === index ? (
                        <div className="mx-2 my-1 h-11 rounded-md border border-sky-300 bg-sky-100/80 dark:border-sky-700 dark:bg-sky-950/30" />
                      ) : null}
                      <SortableProjectTaskRow
                        task={task}
                        project={project}
                        onToggleComplete={onToggleComplete}
                        onOpenTaskDetails={onOpenTaskDetails}
                      />
                    </div>
                  ))}
                  {shouldRenderDropIndicator && dropIndicatorIndex === tasks.length ? (
                    <div className="mx-2 my-1 h-11 rounded-md border border-sky-300 bg-sky-100/80 dark:border-sky-700 dark:bg-sky-950/30" />
                  ) : null}
                </div>
              </SortableTaskList>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectColumn;
