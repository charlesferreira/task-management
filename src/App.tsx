import { useEffect, useMemo, useState } from "react";
import TaskDetailsDrawer from "./components/TaskDetailsDrawer";
import TodayStatsWidget from "./components/TodayStatsWidget";
import { useProjects } from "./hooks/useProjects";
import { useTasks } from "./hooks/useTasks";
import BoardView from "./pages/BoardView";
import ListView from "./pages/ListView";
import ZenView from "./pages/ZenView";

function App() {
  const [activeView, setActiveView] = useState<"board" | "list" | "zen">(
    "board",
  );
  const [lastNonZenView, setLastNonZenView] = useState<"board" | "list">(
    "board",
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const isZen = activeView === "zen";

  const [filter, setFilter] = useState<"all" | "active" | "completed">(() => {
    const stored = localStorage.getItem("taskOrganizer.filter");
    if (stored === "active" || stored === "completed" || stored === "all") {
      return stored;
    }
    return "all";
  });

  const {
    projects,
    unassignedProject,
    createProject,
    reorderProjects,
    updateProject,
    updateUnassignedProjectName,
  } = useProjects();
  const {
    tasks,
    reorderVisibleTasks,
    addTaskAfterProject,
    addTaskAtTop,
    moveTaskInBoard,
    toggleComplete,
    deleteTask,
    deleteCompleted,
    updateTaskTitle,
    updateTaskDetails,
    toggleTracking,
    isTaskTracking,
    getTaskLiveMinutes,
    todayStats,
    setTasks,
  } = useTasks();

  useEffect(() => {
    localStorage.setItem("taskOrganizer.filter", filter);
  }, [filter]);

  const filteredTasks = useMemo(() => {
    if (filter === "active") {
      return tasks.filter((task) => !task.completedAt);
    }
    if (filter === "completed") {
      return tasks.filter((task) => task.completedAt);
    }
    return tasks;
  }, [filter, tasks]);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completedAt).length,
    [tasks],
  );

  const focusedTask = useMemo(() => {
    return tasks.find((task) => !task.completedAt) ?? tasks[0] ?? null;
  }, [tasks]);

  const focusedProject = useMemo(() => {
    if (!focusedTask) return null;
    if (focusedTask.projectId === null) return unassignedProject;

    return (
      projects.find((project) => project.id === focusedTask.projectId) ??
      unassignedProject
    );
  }, [focusedTask, projects, unassignedProject]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

  const isTaskDrawerOpen = selectedTaskId !== null && selectedTask !== null;

  const handleDeleteProject = (projectId: string) => {
    reorderProjects(projects.filter((project) => project.id !== projectId));
    const updatedTasks = tasks.map((task) =>
      task.projectId === projectId ? { ...task, projectId: null } : task,
    );
    setTasks(updatedTasks);
  };

  const handleChangeView = (view: "board" | "list" | "zen") => {
    if (view === "zen") {
      if (activeView !== "zen") {
        setLastNonZenView(activeView as "board" | "list");
      }
      setActiveView("zen");
      return;
    }
    setLastNonZenView(view);
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div
        className={`group relative flex min-h-screen w-full flex-col ${
          isZen ? "px-6 py-0" : "gap-6 px-6 py-8"
        }`}
      >
        {isZen ? (
          <div className="absolute inset-x-0 top-0 z-20 h-20">
            <div className="flex justify-end px-6 pt-4">
              <button
                type="button"
                onClick={() => setActiveView(lastNonZenView)}
                className="pointer-events-auto p-0 text-4xl leading-none font-light text-white opacity-0 transition group-hover:opacity-100 hover:opacity-80"
                aria-label="Exit zen mode"
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <header className="flex flex-col gap-4 transition md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Task Organizer
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-1 rounded-lg border border-slate-200/70 bg-slate-50 p-1 dark:border-slate-800/70 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => handleChangeView("board")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeView === "board"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  Board
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeView("list")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeView === "list"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  Global list
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeView("zen")}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Zen
                </button>
              </div>
            </div>
          </header>
        )}

        <div className={isZen ? "flex flex-1" : ""}>
          {activeView === "zen" ? (
            <ZenView
              task={focusedTask}
              project={focusedProject}
              onOpenDetails={setSelectedTaskId}
              onToggleTracking={toggleTracking}
              isTaskTracking={isTaskTracking}
              getTaskLiveMinutes={getTaskLiveMinutes}
            />
          ) : activeView === "board" ? (
            <BoardView
              projects={projects}
              unassignedProject={unassignedProject}
              tasks={filteredTasks}
              allTasks={tasks}
              onAddTask={addTaskAfterProject}
              onCreateProject={createProject}
              onDeleteProject={handleDeleteProject}
              onReorderProjects={reorderProjects}
              onReorderProjectTasks={moveTaskInBoard}
              onToggleComplete={toggleComplete}
              onDeleteTask={deleteTask}
              onUpdateTaskTitle={updateTaskTitle}
              onOpenTaskDetails={setSelectedTaskId}
              onUpdateProject={updateProject}
              onUpdateUnassignedProjectName={updateUnassignedProjectName}
            />
          ) : (
            <ListView
              projects={projects}
              unassignedProject={unassignedProject}
              tasks={filteredTasks}
              filter={filter}
              onFilterChange={setFilter}
              completedCount={completedCount}
              onDeleteCompleted={deleteCompleted}
              onReorder={reorderVisibleTasks}
              onAddTask={addTaskAtTop}
              onToggleComplete={toggleComplete}
              onDeleteTask={deleteTask}
              onUpdateTaskTitle={updateTaskTitle}
              onOpenTaskDetails={setSelectedTaskId}
            />
          )}
        </div>
        <TaskDetailsDrawer
          isOpen={isTaskDrawerOpen}
          task={selectedTask}
          projects={projects}
          unassignedProject={unassignedProject}
          onClose={() => setSelectedTaskId(null)}
          onDelete={deleteTask}
          onSave={updateTaskDetails}
        />
        {!isZen ? (
          <TodayStatsWidget
            tasksCompleted={todayStats.tasksCompleted}
            pointsCompleted={todayStats.pointsCompleted}
            effortMinutes={todayStats.effortMinutes}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;
