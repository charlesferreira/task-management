import { useState } from "react";
import TaskTimerButton from "../components/TaskTimerButton";
import type { Project, Task } from "../models/types";

type ZenTaskRow = {
  task: Task;
  project: Project | null;
  isTracking: boolean;
  liveMinutes: number;
  getTaskLiveMinutes: (taskId: string) => number;
};

type ZenViewProps = {
  rows: ZenTaskRow[];
  onOpenDetails: (taskId: string) => void;
  onToggleTracking: (taskId: string) => void;
  onComplete: (taskId: string) => void;
};

const ZenView = ({
  rows,
  onOpenDetails,
  onToggleTracking,
  onComplete,
}: ZenViewProps) => {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

  return (
    <section className="relative flex w-full flex-1 items-center justify-center px-4 py-8 md:px-6">
      {rows.length > 0 ? (
        <div className="mx-auto w-full max-w-5xl">
          <div className="space-y-2">
            {rows.map(
              ({
                task,
                project,
                isTracking,
                liveMinutes,
                getTaskLiveMinutes,
              }) => (
                <div
                  key={task.id}
                  onMouseEnter={() => setHoveredTaskId(task.id)}
                  onMouseLeave={() =>
                    setHoveredTaskId((current) =>
                      current === task.id ? null : current,
                    )
                  }
                  onFocusCapture={() => setFocusedTaskId(task.id)}
                  onBlurCapture={(event) => {
                    if (event.currentTarget.contains(event.relatedTarget as Node)) {
                      return;
                    }
                    setFocusedTaskId((current) =>
                      current === task.id ? null : current,
                    );
                  }}
                  onClick={() => onOpenDetails(task.id)}
                  className="group/task group/zen-row cursor-pointer rounded-xl px-3 py-2 transition hover:bg-white/30 focus-within:bg-white/30 dark:hover:bg-slate-900/30 dark:focus-within:bg-slate-900/30"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {project ? (
                        <div className="inline-flex max-w-3 shrink-0 items-center overflow-hidden rounded-full border border-transparent bg-transparent px-0 py-0 text-xs font-semibold text-slate-600 transition-all duration-150 group-hover/zen-row:max-w-max group-hover/zen-row:border-slate-200/70 group-hover/zen-row:bg-white group-hover/zen-row:px-3 group-hover/zen-row:py-1 group-hover/zen-row:text-slate-600 group-hover/zen-row:shadow-sm group-focus-within/zen-row:max-w-max group-focus-within/zen-row:border-slate-200/70 group-focus-within/zen-row:bg-white group-focus-within/zen-row:px-3 group-focus-within/zen-row:py-1 group-focus-within/zen-row:text-slate-600 group-focus-within/zen-row:shadow-sm dark:text-slate-300 dark:group-hover/zen-row:border-slate-700 dark:group-hover/zen-row:bg-slate-900 dark:group-hover/zen-row:text-slate-300 dark:group-focus-within/zen-row:border-slate-700 dark:group-focus-within/zen-row:bg-slate-900 dark:group-focus-within/zen-row:text-slate-300">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-150 group-hover/zen-row:ml-2 group-hover/zen-row:max-w-none group-hover/zen-row:opacity-100 group-focus-within/zen-row:ml-2 group-focus-within/zen-row:max-w-none group-focus-within/zen-row:opacity-100">
                            {project.name}
                          </span>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className="min-w-0 truncate text-left text-2xl leading-tight font-semibold text-slate-900 transition group-hover/zen-row:opacity-80 group-focus-visible/zen-row:opacity-80 focus-visible:underline focus-visible:outline-none md:text-3xl dark:text-slate-100"
                        aria-label={`Open details for ${task.title}`}
                      >
                        {task.title}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <TaskTimerButton
                        taskId={task.id}
                        minutes={liveMinutes}
                        isRunning={isTracking}
                        getTaskLiveMinutes={getTaskLiveMinutes}
                        onToggle={() => onToggleTracking(task.id)}
                        alwaysVisible
                        interactive
                        showLeadingIcon
                        dimWhenPaused
                        forceToggleIcon={
                          hoveredTaskId === task.id || focusedTaskId === task.id
                        }
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isTracking) onToggleTracking(task.id);
                          onComplete(task.id);
                        }}
                        className="max-w-0 overflow-hidden rounded-lg border border-slate-200/70 bg-white px-0 py-1.5 text-xs font-semibold text-slate-600 opacity-0 transition-all duration-150 group-hover/zen-row:max-w-24 group-hover/zen-row:px-3 group-hover/zen-row:opacity-100 group-focus-within/zen-row:max-w-24 group-focus-within/zen-row:px-3 group-focus-within/zen-row:opacity-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        <p className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          No tasks started
        </p>
      )}
    </section>
  );
};

export default ZenView;
