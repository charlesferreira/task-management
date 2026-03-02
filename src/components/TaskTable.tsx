import type { Project, Task } from "../models/types";
import type { CSSProperties } from "react";
import { useSortableTask } from "../hooks/useSortableTask";
import { formatMinutesAsHourMinuteClock } from "../utils/timeFormat";
import ProjectBadge from "./ProjectBadge";
import SortableTaskList from "./SortableTaskList";
import StoryPointsBadge from "./StoryPointsBadge";
import TaskDndProvider from "./TaskDndProvider";
import { TASK_ROW_BORDER_CLASS, TASK_ROW_HOVER_CLASS } from "./taskRowStyles";

type TaskTableProps = {
  tasks: Task[];
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void;
  onOpenTaskDetails: (taskId: string) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  showTrack?: boolean;
  showCompleteToggle?: boolean;
  showProject?: boolean;
  onToggleComplete?: (taskId: string) => void;
  onSetZenVisibility?: (taskId: string, showInZen: boolean) => void;
  resolveProject?: (task: Task) => Project | null;
  className?: string;
};

type SortableTaskRowProps = {
  index: number;
  task: Task;
  onOpenTaskDetails: (taskId: string) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  showTrack: boolean;
  showCompleteToggle: boolean;
  showProject: boolean;
  onToggleComplete?: (taskId: string) => void;
  onSetZenVisibility?: (taskId: string, showInZen: boolean) => void;
  project: Project | null;
};

type TaskDragOverlayRowProps = {
  index: number;
  task: Task;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  showTrack: boolean;
  showCompleteToggle: boolean;
  showProject: boolean;
  project: Project | null;
};

const DRAG_OVERLAY_STYLE: CSSProperties = {
  width: "min(42rem, calc(100vw - 3rem))",
};

const SortableTaskRow = ({
  index,
  task,
  onOpenTaskDetails,
  isTaskTracking,
  getTaskLiveMinutes,
  showTrack,
  showCompleteToggle,
  showProject,
  onToggleComplete,
  onSetZenVisibility,
  project,
}: SortableTaskRowProps) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    isDragging,
    style,
  } = useSortableTask(task.id);

  const liveMinutes = getTaskLiveMinutes(task.id);
  const isTracking = isTaskTracking(task.id);
  const hasTrackedTime = liveMinutes > 0;
  const timerLabel = hasTrackedTime
    ? formatMinutesAsHourMinuteClock(liveMinutes)
    : "-";

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpenTaskDetails(task.id)}
      className={`group/task cursor-pointer ${TASK_ROW_BORDER_CLASS} ${TASK_ROW_HOVER_CLASS} transition-colors last:border-b-0 ${
        isDragging ? "opacity-0" : ""
      }`}
    >
      {showCompleteToggle ? (
        <td className="w-px px-3 py-3 align-middle">
          <div className="flex items-center justify-center">
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onToggleComplete?.(task.id);
              }}
              className={`flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-lg border text-xs leading-none transition ${
                task.completedAt
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 text-transparent hover:text-slate-300 dark:border-slate-600 dark:hover:text-slate-500"
              }`}
              aria-label={
                task.completedAt ? "Mark task incomplete" : "Mark task complete"
              }
            >
              ✓
            </button>
          </div>
        </td>
      ) : null}
      <td className="w-px px-3 py-3 align-middle">
        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
          {index}
        </span>
      </td>
      {showTrack ? (
        <td className="w-px px-3 py-3 align-middle">
          <div className="flex items-center justify-center">
            <button
              type="button"
              role="switch"
              aria-checked={task.showInZen}
              aria-label={
                task.showInZen ? "Hide task from zen mode" : "Show task in zen mode"
              }
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onSetZenVisibility?.(task.id, !task.showInZen);
              }}
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
      <td ref={setActivatorNodeRef} className="w-full px-3 py-3 align-middle">
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
      <td className="w-px px-3 py-3 align-middle">
        <div className="flex items-center justify-center">
          <StoryPointsBadge storyPoints={task.storyPoints} />
        </div>
      </td>
      <td className="w-px px-3 py-3 align-middle">
        <div className="flex items-center justify-center">
          {hasTrackedTime ? (
            <span
              className={`font-mono text-xs font-semibold tabular-nums ${
                isTracking
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {timerLabel}
            </span>
          ) : (
            <StoryPointsBadge storyPoints={null} />
          )}
        </div>
      </td>
      {showProject ? (
        <td className="w-px px-3 py-3 align-middle">
          <div className="flex items-center justify-center">
            {project ? <ProjectBadge project={project} /> : null}
          </div>
        </td>
      ) : null}
    </tr>
  );
};

const TaskDragOverlayRow = ({
  index,
  task,
  isTaskTracking,
  getTaskLiveMinutes,
  showTrack,
  showCompleteToggle,
  showProject,
  project,
}: TaskDragOverlayRowProps) => {
  const liveMinutes = getTaskLiveMinutes(task.id);
  const isTracking = isTaskTracking(task.id);
  const hasTrackedTime = liveMinutes > 0;
  const timerLabel = hasTrackedTime
    ? formatMinutesAsHourMinuteClock(liveMinutes)
    : "-";

  return (
    <div
      style={DRAG_OVERLAY_STYLE}
      className="rounded-lg border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center">
        {showCompleteToggle ? (
          <div className="flex w-[60px] shrink-0 items-center justify-center px-3 py-3">
            <div
              className={`flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-lg border text-xs leading-none ${
                task.completedAt
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 text-transparent dark:border-slate-600"
              }`}
            >
              ✓
            </div>
          </div>
        ) : null}
        <div className="flex w-[44px] shrink-0 items-center justify-center px-3 py-3">
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
            {index}
          </span>
        </div>
        {showTrack ? (
          <div className="flex w-[68px] shrink-0 items-center justify-center px-3 py-3">
            <div
              className={`relative inline-flex h-5 w-9 items-center rounded-full border ${
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
            </div>
          </div>
        ) : null}
        <div className="min-w-0 flex-1 px-3 py-3">
          <span
            className={`block truncate text-sm font-medium ${
              task.completedAt
                ? "text-slate-400 line-through dark:text-slate-500"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {task.title}
          </span>
        </div>
        <div className="flex shrink-0 items-center justify-center px-3 py-3">
          <StoryPointsBadge storyPoints={task.storyPoints} />
        </div>
        <div className="flex min-w-[62px] shrink-0 items-center justify-center px-3 py-3">
          {hasTrackedTime ? (
            <span
              className={`font-mono text-xs font-semibold tabular-nums ${
                isTracking
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {timerLabel}
            </span>
          ) : (
            <StoryPointsBadge storyPoints={null} />
          )}
        </div>
        {showProject ? (
          <div className="flex shrink-0 items-center justify-center px-3 py-3">
            {project ? <ProjectBadge project={project} /> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const TaskTable = ({
  tasks,
  onReorder,
  onOpenTaskDetails,
  isTaskTracking,
  getTaskLiveMinutes,
  showTrack = false,
  showCompleteToggle = false,
  showProject = false,
  onToggleComplete,
  onSetZenVisibility,
  resolveProject,
  className = "",
}: TaskTableProps) => {
  const taskIds = tasks.map((task) => task.id);

  return (
    <TaskDndProvider
      onDragEnd={(activeId, overId) => onReorder(activeId, overId, taskIds)}
      renderDragOverlay={(activeId) => {
        const task = tasks.find((entry) => entry.id === activeId);
        if (!task) return null;
        const project = resolveProject?.(task) ?? null;
        return (
          <TaskDragOverlayRow
            index={tasks.findIndex((entry) => entry.id === activeId) + 1}
            task={task}
            isTaskTracking={isTaskTracking}
            getTaskLiveMinutes={getTaskLiveMinutes}
            showTrack={showTrack}
            showCompleteToggle={showCompleteToggle}
            showProject={showProject}
            project={project}
          />
        );
      }}
    >
      <SortableTaskList taskIds={taskIds}>
        <table className={`w-full table-auto ${className}`}>
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-slate-800/70">
              {showCompleteToggle ? (
                <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Done
                </th>
              ) : null}
              <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                #
              </th>
              {showTrack ? (
                <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Track
                </th>
              ) : null}
              <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Task
              </th>
              <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                SP
              </th>
              <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Time
              </th>
              {showProject ? (
                <th className="w-px px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Project
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <SortableTaskRow
                key={task.id}
                index={index + 1}
                task={task}
                onOpenTaskDetails={onOpenTaskDetails}
                isTaskTracking={isTaskTracking}
                getTaskLiveMinutes={getTaskLiveMinutes}
                showTrack={showTrack}
                showCompleteToggle={showCompleteToggle}
                showProject={showProject}
                onToggleComplete={onToggleComplete}
                onSetZenVisibility={onSetZenVisibility}
                project={resolveProject?.(task) ?? null}
              />
            ))}
          </tbody>
        </table>
      </SortableTaskList>
    </TaskDndProvider>
  );
};

export default TaskTable;
