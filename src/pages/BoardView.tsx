import { useState } from "react";
import ProjectBoard from "../components/ProjectBoard";
import type { Project, Task } from "../models/types";

type BoardViewProps = {
  projects: Project[];
  tasks: Task[];
  onAddTask: (title: string, projectId: string | null) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject: (name: string, color: string) => void;
  onReorderProjects: (projects: Project[]) => void;
  onReorderProjectTasks: (
    projectId: string | null,
    activeId: string,
    overId: string,
  ) => void;
};

const BoardView = ({
  projects,
  tasks,
  onAddTask,
  onDeleteProject,
  onCreateProject,
  onReorderProjects,
  onReorderProjectTasks,
}: BoardViewProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#38bdf8");

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreateProject(trimmed, color || "#38bdf8");
    setName("");
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Project Board
          </h1>
          <p className="text-sm text-slate-500">
            Tasks are grouped by project using the global order.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCreate();
            }}
            placeholder="New project name"
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-10 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
              aria-label="Project color"
            />
            <button
              type="button"
              onClick={handleCreate}
              className="min-w-max rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add project
            </button>
          </div>
        </div>
      </header>
      <ProjectBoard
        projects={projects}
        tasks={tasks}
        onAddTask={onAddTask}
        onDeleteProject={onDeleteProject}
        onReorderProjects={onReorderProjects}
        onReorderProjectTasks={onReorderProjectTasks}
      />
    </section>
  );
};

export default BoardView;
