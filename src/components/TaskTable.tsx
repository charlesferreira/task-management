import type { DragEndEvent } from "@dnd-kit/core";
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
import type { Project, Task } from "../models/types";
import { formatMinutesAsHourMinuteClock } from "../utils/timeFormat";
import ProjectBadge from "./ProjectBadge";
import StoryPointsBadge from "./StoryPointsBadge";

type TaskTableProps = {
  tasks: Task[];
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void;
  onOpenTaskDetails: (taskId: string) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  showTrack?: boolean;
  showProject?: boolean;
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
  showProject: boolean;
  onSetZenVisibility?: (taskId: string, showInZen: boolean) => void;
  project: Project | null;
};

const SortableTaskRow = ({
  index,
  task,
  onOpenTaskDetails,
  isTaskTracking,
  getTaskLiveMinutes,
  showTrack,
  showProject,
  onSetZenVisibility,
  project,
}: SortableTaskRowProps) => {
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
      className={`group/task cursor-pointer border-b border-slate-200/70 transition-colors last:border-b-0 hover:bg-white/30 dark:border-slate-800/70 dark:hover:bg-slate-800/30 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
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

const TaskTable = ({
  tasks,
  onReorder,
  onOpenTaskDetails,
  isTaskTracking,
  getTaskLiveMinutes,
  showTrack = false,
  showProject = false,
  onSetZenVisibility,
  resolveProject,
  className = "",
}: TaskTableProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(
      String(active.id),
      String(over.id),
      tasks.map((task) => task.id),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <table className={`w-full table-auto ${className}`}>
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-slate-800/70">
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
                showProject={showProject}
                onSetZenVisibility={onSetZenVisibility}
                project={resolveProject?.(task) ?? null}
              />
            ))}
          </tbody>
        </table>
      </SortableContext>
    </DndContext>
  );
};

export default TaskTable;
