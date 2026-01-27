import { useState } from "react";
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
  onUpdateProject: (projectId: string, updates: { name: string; color: string }) => void;
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

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreateProject(trimmed, color || "#38bdf8");
    setName("");
    setShowProjectForm(false);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Project Board
          </h1>
          <p className="text-sm text-slate-500">
            Tasks are grouped by project using the global order.
          </p>
        </div>
      </header>
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
        <div className="fixed bottom-24 right-6 z-40 w-[min(420px,calc(100vw-3rem))] rounded-xl border border-slate-200/70 bg-white p-5 shadow-md">
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreate();
                if (event.key === "Escape") setShowProjectForm(false);
              }}
              placeholder="New project name"
              className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full border border-slate-200/70 bg-white p-1 shadow-sm">
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
                className="min-w-max rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
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
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white shadow-md transition hover:translate-y-[-1px]"
        aria-label="Add project"
      >
        +
      </button>
    </section>
  );
};

export default BoardView;
