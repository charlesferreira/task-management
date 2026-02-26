import { Plus } from "lucide-react";
import GlobalTaskList from "../components/GlobalTaskList";
import ThemeToggleButton, {
  type ThemeMode,
} from "../components/ThemeToggleButton";
import type { Project, Task } from "../models/types";

type ListViewProps = {
  projects: Project[];
  unassignedProject: Project;
  tasks: Task[];
  filter: "all" | "active" | "completed";
  onFilterChange: (mode: "all" | "active" | "completed") => void;
  completedCount: number;
  onDeleteCompleted: () => void;
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void;
  onCreateTask: () => void;
  onOpenTaskDetails: (taskId: string) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
};

const ListView = ({
  projects,
  unassignedProject,
  tasks,
  filter,
  onFilterChange,
  completedCount,
  onDeleteCompleted,
  onReorder,
  onCreateTask,
  onOpenTaskDetails,
  isTaskTracking,
  getTaskLiveMinutes,
  themeMode,
  onToggleTheme,
}: ListViewProps) => {
  return (
    <section className="space-y-6 pb-24">
      <GlobalTaskList
        projects={projects}
        unassignedProject={unassignedProject}
        tasks={tasks}
        hideHeader
        filter={filter}
        onFilterChange={onFilterChange}
        completedCount={completedCount}
        onDeleteCompleted={onDeleteCompleted}
        onReorder={onReorder}
        onOpenTaskDetails={onOpenTaskDetails}
        isTaskTracking={isTaskTracking}
        getTaskLiveMinutes={getTaskLiveMinutes}
      />
      <div className="fixed right-6 bottom-6 z-40 flex items-center gap-2">
        <ThemeToggleButton mode={themeMode} onToggle={onToggleTheme} />
        <button
          type="button"
          onClick={onCreateTask}
          className="group/fab flex h-14 w-14 items-center justify-center gap-0 overflow-hidden rounded-full bg-slate-900 px-0 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:w-36 hover:justify-start hover:gap-2 hover:px-5 dark:bg-slate-100 dark:text-slate-900"
          aria-label="Add task"
        >
          <span
            className="flex h-6 w-6 items-center justify-center transition-transform duration-200"
            aria-hidden="true"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <span className="w-full max-w-0 min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-150 group-hover/fab:max-w-36 group-hover/fab:opacity-100">
            Add task
          </span>
        </button>
      </div>
    </section>
  );
};

export default ListView;
