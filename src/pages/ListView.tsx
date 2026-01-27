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
    setShowCreate(false);
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold text-slate-900">
          Global Task List
        </h1>
        <p className="text-sm text-slate-500">
          Reordering here updates every project view instantly.
        </p>
      </header>
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
        <div className="fixed bottom-24 right-6 z-40 w-[min(420px,calc(100vw-3rem))] rounded-xl border border-slate-200/70 bg-white p-5 shadow-md">
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
                if (event.key === "Escape") setShowCreate(false);
              }}
              placeholder="Task title"
              className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <select
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                className="w-full min-w-max rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
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
        onClick={() => setShowCreate((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white shadow-md transition hover:translate-y-[-1px]"
        aria-label="Add task"
      >
        +
      </button>
    </section>
  );
};

export default ListView;
