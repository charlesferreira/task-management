import { useEffect, useMemo, useRef, useState } from "react";
import GlobalTaskList from "../components/GlobalTaskList";
import {
  UNASSIGNED_PROJECT,
  UNASSIGNED_PROJECT_ID,
  type Project,
  type Task,
} from "../models/types";

type ListViewProps = {
  projects: Project[];
  tasks: Task[];
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void;
  onAddTask: (title: string, projectId: string | null) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskTitle: (taskId: string, title: string) => void;
};

const ListView = ({
  projects,
  tasks,
  onReorder,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onUpdateTaskTitle,
}: ListViewProps) => {
  const [title, setTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState(UNASSIGNED_PROJECT_ID);
  const [showCreate, setShowCreate] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.order - b.order);
  }, [projects]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const projectId =
      selectedProject === UNASSIGNED_PROJECT_ID ? null : selectedProject;
    onAddTask(trimmed, projectId);
    setTitle("");
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  useEffect(() => {
    if (!showCreate) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (fabRef.current?.contains(target)) return;
      setShowCreate(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [showCreate]);

  return (
    <section className="space-y-6 pb-24">
      <GlobalTaskList
        projects={projects}
        tasks={tasks}
        hideHeader
        onReorder={onReorder}
        onToggleComplete={onToggleComplete}
        onDeleteTask={onDeleteTask}
        onUpdateTaskTitle={onUpdateTaskTitle}
      />
      {showCreate ? (
        <div
          ref={panelRef}
          className="fixed right-6 bottom-24 z-40 w-[min(420px,calc(100vw-3rem))] rounded-xl border border-slate-200/70 bg-white p-5 shadow-md dark:border-slate-800/70 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-3">
            <input
              ref={inputRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
                if (event.key === "Escape") setShowCreate(false);
              }}
              placeholder="Task title"
              className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <select
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSubmit();
                  }
                }}
                className="w-full min-w-max rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-slate-500"
              >
                <option value={UNASSIGNED_PROJECT_ID}>
                  {UNASSIGNED_PROJECT.name}
                </option>
                {orderedProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSubmit}
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
        onClick={() => setShowCreate((prev) => !prev)}
        ref={fabRef}
        className="group/fab fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center gap-0 overflow-hidden rounded-full bg-slate-900 px-0 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:w-36 hover:justify-start hover:gap-2 hover:px-5 dark:bg-slate-100 dark:text-slate-900"
        aria-label="Add task"
      >
        <span
          className="flex h-6 w-6 items-center justify-center transition-transform duration-200"
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
        <span className="w-full max-w-0 min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-150 group-hover/fab:max-w-36 group-hover/fab:opacity-100">
          Add task
        </span>
      </button>
    </section>
  );
};

export default ListView;
