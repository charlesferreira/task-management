import { Plus } from "lucide-react";
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
  return (
    <div
      className={`relative flex h-full min-h-0 items-start ${
        fillWidth ? "w-full" : "w-96 shrink-0"
      }`}
    >
      <div className="group/column relative flex h-full max-h-full w-full flex-col gap-3 rounded-xl border border-slate-200/70 bg-white px-5 pt-5 pb-5 shadow-sm transition dark:border-slate-800/70 dark:bg-slate-900">
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
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label={`Add task to ${project.name}`}
          >
            <Plus className="h-4 w-4" />
            <span>Add task</span>
          </button>
        </div>
        <div className="min-h-0">
          {tasks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200/70 bg-white px-3 py-5 text-center text-xs text-slate-500 dark:border-slate-800/70 dark:bg-slate-900 dark:text-slate-400">
              No tasks to show
            </p>
          ) : (
            <div
              className={`flex max-h-[calc(100vh-18rem)] flex-col overflow-y-auto pr-1 transition-[padding] duration-200 ${TASK_ROW_DIVIDER_CLASS}`}
            >
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  project={project}
                  styleVariant="row"
                  showProjectBadge={false}
                  showCompleteToggle
                  onToggleComplete={onToggleComplete}
                  onOpenDetails={onOpenTaskDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectColumn;
