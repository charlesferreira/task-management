import { useMemo, useState } from "react";
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
  onReorder: (tasks: Task[]) => void;
  onAddTask: (title: string, projectId: string | null) => void;
};

const ListView = ({ projects, tasks, onReorder, onAddTask }: ListViewProps) => {
  const [title, setTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState(UNASSIGNED_PROJECT_ID);

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
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Global Task List
        </h1>
        <p className="text-sm text-slate-500">
          Reordering here updates every project view instantly.
        </p>
      </header>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">
          Create a new task
        </h2>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
            placeholder="Task title"
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
          <div className="flex flex-1 items-center gap-2">
            <select
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
              className="w-full min-w-max rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
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
              className="min-w-max rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add task
            </button>
          </div>
        </div>
      </div>
      <GlobalTaskList projects={projects} tasks={tasks} onReorder={onReorder} />
    </section>
  );
};

export default ListView;
