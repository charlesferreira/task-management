import { useEffect, useRef, useState } from "react";
import ProjectBoard from "../components/ProjectBoard";
import type { Project, Task } from "../models/types";

type BoardViewProps = {
  projects: Project[];
  tasks: Task[];
  allTasks: Task[];
  onAddTask: (title: string, projectId: string | null) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject: (name: string, color: string) => void;
  onReorderProjects: (projects: Project[]) => void;
  onReorderProjectTasks: (
    activeId: string,
    overId: string | null,
    targetProjectId: string | null,
    visibleTaskIds: string[],
  ) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskTitle: (taskId: string, title: string) => void;
  onUpdateProject: (
    projectId: string,
    updates: { name: string; color: string },
  ) => void;
};

const BoardView = ({
  projects,
  tasks,
  allTasks,
  onAddTask,
  onDeleteProject,
  onCreateProject,
  onReorderProjects,
  onReorderProjectTasks,
  onToggleComplete,
  onDeleteTask,
  onUpdateTaskTitle,
  onUpdateProject,
}: BoardViewProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#38bdf8");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreateProject(trimmed, color || "#38bdf8");
    setName("");
    setShowProjectForm(false);
  };

  useEffect(() => {
    if (!showProjectForm) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (fabRef.current?.contains(target)) return;
      setShowProjectForm(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [showProjectForm]);

  return (
    <section className="space-y-6 pb-24">
      <ProjectBoard
        projects={projects}
        tasks={tasks}
        allTasks={allTasks}
        onAddTask={onAddTask}
        onDeleteProject={onDeleteProject}
        onReorderProjects={onReorderProjects}
        onReorderProjectTasks={onReorderProjectTasks}
        onToggleComplete={onToggleComplete}
        onDeleteTask={onDeleteTask}
        onUpdateTaskTitle={onUpdateTaskTitle}
        onUpdateProject={onUpdateProject}
      />
      {showProjectForm ? (
        <div
          ref={panelRef}
          className="fixed right-6 bottom-24 z-40 w-[min(420px,calc(100vw-3rem))] rounded-xl border border-slate-200/70 bg-white p-5 shadow-md dark:border-slate-800/70 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreate();
                if (event.key === "Escape") setShowProjectForm(false);
              }}
              placeholder="New project name"
              className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full border border-slate-200/70 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-full w-full cursor-pointer appearance-none overflow-hidden rounded-full border-0 p-0"
                  aria-label="Project color"
                />
              </div>
              <button
                type="button"
                onClick={handleCreate}
                className="min-w-max rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setShowProjectForm((prev) => !prev)}
        ref={fabRef}
        className="group fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center gap-0 overflow-hidden rounded-full bg-slate-900 px-0 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:w-40 hover:justify-start hover:gap-2 hover:px-4 dark:bg-slate-100 dark:text-slate-900"
        aria-label="Add project"
      >
        <span
          className="flex h-6 w-6 items-center justify-center transition-transform duration-300"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="w-full max-w-0 min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-150 group-hover:max-w-40 group-hover:opacity-100">
          Add project
        </span>
      </button>
    </section>
  );
};

export default BoardView;
