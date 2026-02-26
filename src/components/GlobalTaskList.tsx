import { Archive } from "lucide-react";
import { useMemo, useState } from "react";
import { type Project, type Task } from "../models/types";
import { formatMinutesAsHourMinuteClock } from "../utils/timeFormat";
import ProjectBadge from "./ProjectBadge";
import StoryPointsBadge from "./StoryPointsBadge";
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
  onOpenTaskDetails,
  onSetZenVisibility,
  isTaskTracking,
  getTaskLiveMinutes,
}: GlobalTaskListProps) => {
  const [showArchived, setShowArchived] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

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
  const visibleTaskIds = useMemo(
    () => new Set(visibleTasks.map((task) => task.id)),
    [visibleTasks],
  );
  const selectedVisibleTaskIds = useMemo(
    () => selectedTaskIds.filter((taskId) => visibleTaskIds.has(taskId)),
    [selectedTaskIds, visibleTaskIds],
  );
  const selectedCount = selectedVisibleTaskIds.length;
  const allVisibleSelected =
    visibleTasks.length > 0 && selectedCount === visibleTasks.length;

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((current) => {
      const scoped = current.filter((id) => visibleTaskIds.has(id));
      if (scoped.includes(taskId)) {
        return scoped.filter((id) => id !== taskId);
      }
      return [...scoped, taskId];
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedTaskIds((current) => {
      const scoped = current.filter((id) => visibleTaskIds.has(id));
      if (scoped.length === visibleTasks.length) return [];
      return visibleTasks.map((task) => task.id);
    });
  };

  const taskTableClass = hideHeader ? "" : "mt-4";
  const emptyMessage = showArchived
    ? "No archived tasks."
    : "No tasks.";

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

      {selectionMode || showArchived ? (
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
                    {selectionMode ? (
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        aria-label={allVisibleSelected ? "Unselect all" : "Select all"}
                      />
                    ) : (
                      "#"
                    )}
                  </th>
                  {!showArchived ? (
                    <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Track
                    </th>
                  ) : null}
                  <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Task
                  </th>
                  {!showArchived ? (
                    <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      SP
                    </th>
                  ) : null}
                  {!showArchived ? (
                    <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Time
                    </th>
                  ) : null}
                  {!showArchived ? (
                    <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Project
                    </th>
                  ) : null}
                  {showArchived ? (
                    <th className="w-px px-3 py-2 text-right text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Action
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task, index) => {
                  const project =
                    task.projectId === null
                      ? unassignedProject
                      : (projectMap.get(task.projectId) ?? unassignedProject);
                  const isTracking = isTaskTracking(task.id);
                  const liveMinutes = getTaskLiveMinutes(task.id);
                  const hasTrackedTime = liveMinutes > 0;
                  const selected = selectedVisibleTaskIds.includes(task.id);

                  return (
                    <tr
                      key={task.id}
                      className="border-b border-slate-200/70 transition-colors last:border-b-0 dark:border-slate-800/70"
                    >
                      <td className="w-px px-3 py-3 align-middle text-center">
                        {selectionMode ? (
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                            aria-label={selected ? "Unselect task" : "Select task"}
                          />
                        ) : (
                          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {index + 1}
                          </span>
                        )}
                      </td>
                      {!showArchived ? (
                        <td className="w-px px-3 py-3 align-middle">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={task.showInZen}
                              aria-label={
                                task.showInZen
                                  ? "Hide task from zen mode"
                                  : "Show task in zen mode"
                              }
                              onClick={() =>
                                onSetZenVisibility(task.id, !task.showInZen)
                              }
                              className={`relative inline-flex h-5 w-9 items-center rounded-full border transition ${
                                task.showInZen
                                  ? "border-emerald-500 bg-emerald-500/90"
                                  : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800"
                              }`}
                            >
                              <span
                                className={`block h-3.5 w-3.5 rounded-full bg-white transition ${
                                  task.showInZen ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      ) : null}
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
                      {!showArchived ? (
                        <td className="w-px px-3 py-3 align-middle text-center">
                          <StoryPointsBadge storyPoints={task.storyPoints} />
                        </td>
                      ) : null}
                      {!showArchived ? (
                        <td className="w-px px-3 py-3 align-middle text-center">
                          {hasTrackedTime ? (
                            <span
                              className={`font-mono text-xs font-semibold tabular-nums ${
                                isTracking
                                  ? "text-slate-900 dark:text-slate-100"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {formatMinutesAsHourMinuteClock(liveMinutes)}
                            </span>
                          ) : (
                            <StoryPointsBadge storyPoints={null} />
                          )}
                        </td>
                      ) : null}
                      {!showArchived ? (
                        <td className="w-px px-3 py-3 align-middle text-center">
                          <ProjectBadge project={project} />
                        </td>
                      ) : null}
                      {showArchived ? (
                        <td className="w-px px-3 py-3 align-middle text-right">
                          <button
                            type="button"
                            onClick={() => onUnarchiveTasks([task.id])}
                            className="rounded-lg border border-slate-300/70 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Unarchive
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        activeTasks.length === 0 ? (
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
            showProject
            onSetZenVisibility={onSetZenVisibility}
            resolveProject={(task) =>
              task.projectId === null
                ? unassignedProject
                : (projectMap.get(task.projectId) ?? unassignedProject)
            }
            className={taskTableClass}
          />
        )
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!showArchived ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectionMode((prev) => !prev);
                  setSelectedTaskIds([]);
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  selectionMode
                    ? "border-slate-300 bg-slate-900 text-white dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900"
                    : "border-slate-200/70 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {selectionMode ? "Cancel select" : "Select"}
              </button>

              {selectionMode && selectedCount > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onArchiveTasks(selectedVisibleTaskIds);
                      setSelectedTaskIds([]);
                      setSelectionMode(false);
                    }}
                    className="rounded-lg border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Archive selected ({selectedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteTasks(selectedVisibleTaskIds);
                      setSelectedTaskIds([]);
                      setSelectionMode(false);
                    }}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    Delete selected ({selectedCount})
                  </button>
                </>
              ) : null}
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowArchived((prev) => !prev);
            setSelectionMode(false);
            setSelectedTaskIds([]);
          }}
          className={`inline-flex items-center justify-center rounded-lg border text-xs font-semibold transition ${
            showArchived
              ? "h-9 gap-1.5 border-slate-300 bg-slate-900 px-3 text-white dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900"
              : "h-9 w-9 border-slate-200/70 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
          aria-label={showArchived ? "Show active tasks" : "Show archived tasks"}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? <span>Archived</span> : null}
        </button>
      </div>
    </div>
  );
};

export default GlobalTaskList;
