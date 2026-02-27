import { Archive } from "lucide-react";
import { useMemo, useState } from "react";
import { type Project, type Task } from "../models/types";
import TaskTable from "./TaskTable";

type GlobalTaskListProps = {
  tasks: Task[];
  projects: Project[];
  unassignedProject: Project;
  hideHeader?: boolean;
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void;
  onArchiveTasks: (taskIds: string[]) => void;
  onDeleteTasks: (taskIds: string[]) => void;
  onUnarchiveTasks: (taskIds: string[]) => void;
  onToggleComplete: (taskId: string) => void;
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
  onReorder,
  onArchiveTasks,
  onDeleteTasks,
  onUnarchiveTasks,
  onToggleComplete,
  onOpenTaskDetails,
  onSetZenVisibility,
  isTaskTracking,
  getTaskLiveMinutes,
}: GlobalTaskListProps) => {
  const [showArchived, setShowArchived] = useState(false);

  const projectMap = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.archivedAt),
    [tasks],
  );
  const archivedTasks = useMemo(
    () => tasks.filter((task) => Boolean(task.archivedAt)),
    [tasks],
  );

  const visibleTasks = showArchived ? archivedTasks : activeTasks;
  const completedActiveTaskIds = useMemo(
    () => activeTasks.filter((task) => task.completedAt).map((task) => task.id),
    [activeTasks],
  );

  const taskTableClass = "mt-3";
  const emptyMessage = showArchived ? "No archived tasks." : "No tasks.";

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        {hideHeader ? (
          <p className="pt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {showArchived ? "Archived tasks" : "All tasks"}
          </p>
        ) : (
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Global Task List
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Drag tasks to reorder across all projects.
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {showArchived ? "Archived tasks" : "All tasks"}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setShowArchived((prev) => !prev);
          }}
          className={`group/archive inline-flex h-9 items-center justify-center rounded-lg border text-xs font-semibold transition ${
            showArchived
              ? "gap-1.5 border-slate-300 bg-slate-900 px-3 text-white dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900"
              : "w-9 border-slate-200/70 bg-white text-slate-600 hover:w-auto hover:gap-1.5 hover:bg-slate-50 hover:px-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
          aria-label={
            showArchived ? "Show active tasks" : "Show archived tasks"
          }
          aria-pressed={showArchived}
        >
          <Archive className="h-4 w-4" />
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-150 ${
              showArchived
                ? "max-w-20 opacity-100"
                : "max-w-0 opacity-0 group-hover/archive:max-w-20 group-hover/archive:opacity-100"
            }`}
          >
            Archived
          </span>
        </button>
      </div>

      {showArchived ? (
        visibleTasks.length === 0 ? (
          <div
            className={`${taskTableClass} rounded-lg border border-dashed border-slate-200/70 px-3 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400`}
          >
            {emptyMessage}
          </div>
        ) : (
          <div className={taskTableClass}>
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-slate-800/70">
                  <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Task
                  </th>
                  {showArchived ? (
                    <th className="w-px px-3 py-2 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Action
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task, index) => {
                  return (
                    <tr
                      key={task.id}
                      className="border-b border-slate-200/70 transition-colors last:border-b-0 dark:border-slate-800/70"
                    >
                      <td className="w-px px-3 py-3 text-center align-middle">
                        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <span
                          className={`block truncate text-sm font-medium ${
                            task.completedAt
                              ? "text-slate-400 line-through dark:text-slate-500"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {task.title}
                        </span>
                      </td>
                      {showArchived ? (
                        <td className="w-px px-3 py-3 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onUnarchiveTasks([task.id])}
                              className="rounded-lg border border-slate-300/70 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Unarchive
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteTasks([task.id])}
                              className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : activeTasks.length === 0 ? (
        <div
          className={`${taskTableClass} rounded-lg border border-dashed border-slate-200/70 px-3 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400`}
        >
          {emptyMessage}
        </div>
      ) : (
        <TaskTable
          tasks={activeTasks}
          onReorder={onReorder}
          onOpenTaskDetails={onOpenTaskDetails}
          isTaskTracking={isTaskTracking}
          getTaskLiveMinutes={getTaskLiveMinutes}
          showTrack
          showCompleteToggle
          showProject
          onToggleComplete={onToggleComplete}
          onSetZenVisibility={onSetZenVisibility}
          resolveProject={(task) =>
            task.projectId === null
              ? unassignedProject
              : (projectMap.get(task.projectId) ?? unassignedProject)
          }
          className={taskTableClass}
        />
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!showArchived && completedActiveTaskIds.length > 0 ? (
            <button
              type="button"
              onClick={() => onArchiveTasks(completedActiveTaskIds)}
              className="rounded-lg border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Archive completed ({completedActiveTaskIds.length})
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GlobalTaskList;
