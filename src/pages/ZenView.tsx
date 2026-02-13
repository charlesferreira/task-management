import { useEffect, useState } from "react";
import type { Project, Task } from "../models/types";

type ZenViewProps = {
  task: Task | null;
  project: Project | null;
  upcomingTasks: Task[];
  onComplete: (taskId: string) => void;
};

const ZenView = ({
  task,
  project,
  upcomingTasks,
  onComplete,
}: ZenViewProps) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setIsFading(false);
  }, [task?.id]);

  const handleComplete = () => {
    if (!task) return;
    setIsFading(true);
    window.setTimeout(() => {
      onComplete(task.id);
    }, 180);
  };

  return (
    <section className="group relative w-full flex-1">
      {task ? (
        <div
          key={task.id}
          className={`absolute inset-0 flex items-center justify-center text-center transition-opacity duration-200 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex w-full max-w-4xl flex-col items-center gap-10 md:gap-12">
            {project ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </div>
            ) : null}
            <h2 className="text-4xl leading-tight font-semibold text-slate-900 md:text-6xl dark:text-slate-100">
              {task.title}
            </h2>
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-lg border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-600 opacity-0 shadow-sm transition group-focus-within:opacity-100 group-hover:opacity-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              Mark complete
            </button>
          </div>
        </div>
      ) : (
        <p className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          No tasks available
        </p>
      )}
      {upcomingTasks.length > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="group/upcoming pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-t-2xl border border-b-0 border-slate-700/80 bg-slate-950/95 px-5 pt-3 pb-0 shadow-lg backdrop-blur transition-all duration-300">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                Coming up
              </p>
            </div>
            <div className="relative mt-2 max-h-6 pb-3 transition-all duration-300 group-hover/upcoming:max-h-28">
              <ul className="space-y-2">
                {upcomingTasks.map((upcomingTask) => (
                  <li
                    key={upcomingTask.id}
                    className="truncate text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {upcomingTask.title}
                  </li>
                ))}
              </ul>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-transparent to-slate-950/95 transition-opacity duration-300 group-hover/upcoming:opacity-0" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ZenView;
