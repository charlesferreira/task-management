import { useMemo } from "react";
import { type Project, type Task } from "../models/types";
import TaskTable from "./TaskTable";

type GlobalTaskListProps = {
  tasks: Task[];
  projects: Project[];
  unassignedProject: Project;
  hideHeader?: boolean;
  filter?: "all" | "active" | "completed";
  onFilterChange?: (mode: "all" | "active" | "completed") => void;
  completedCount?: number;
  onDeleteCompleted?: () => void;
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void;
  onOpenTaskDetails: (taskId: string) => void;
  onSetZenVisibility: (taskId: string, showInZen: boolean) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
};

const GlobalTaskList = ({
  tasks,
  projects,
  unassignedProject,
  hideHeader = false,
  filter,
  onFilterChange,
  completedCount = 0,
  onDeleteCompleted,
  onReorder,
  onOpenTaskDetails,
  onSetZenVisibility,
  isTaskTracking,
  getTaskLiveMinutes,
}: GlobalTaskListProps) => {
  const projectMap = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
      {hideHeader ? null : (
        <>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Global Task List
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag tasks to reorder across all projects.
          </p>
        </>
      )}
      {filter && onFilterChange ? (
        <div
          className={`${hideHeader ? "" : "mt-4"} flex flex-wrap items-center gap-2`}
        >
          <div className="flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white p-1 dark:border-slate-800/70 dark:bg-slate-900">
            {(["all", "active", "completed"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onFilterChange(mode)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                  filter === mode
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onDeleteCompleted}
            disabled={completedCount === 0}
            className="rounded-lg border border-slate-200/70 px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800/70 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          >
            Delete completed
          </button>
        </div>
      ) : null}
      <TaskTable
        tasks={tasks}
        onReorder={onReorder}
        onOpenTaskDetails={onOpenTaskDetails}
        isTaskTracking={isTaskTracking}
        getTaskLiveMinutes={getTaskLiveMinutes}
        showTrack
        showProject
        onSetZenVisibility={onSetZenVisibility}
        resolveProject={(task) =>
          task.projectId === null
            ? unassignedProject
            : (projectMap.get(task.projectId) ?? unassignedProject)
        }
        className={hideHeader && !(filter && onFilterChange) ? "" : "mt-4"}
      />
    </div>
  );
};

export default GlobalTaskList;
