import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import TaskDetailsDrawer from "./components/TaskDetailsDrawer";
import TodayStatsWidget from "./components/TodayStatsWidget";
import { useProjects } from "./hooks/useProjects";
import { useTasks } from "./hooks/useTasks";
import BoardView from "./pages/BoardView";
import ListView from "./pages/ListView";
import ZenView from "./pages/ZenView";

type AppView = "board" | "list" | "zen";

const isAppView = (value: string | undefined): value is AppView =>
  value === "board" || value === "list" || value === "zen";

function App() {
  const params = useParams();
  const navigate = useNavigate();
  const activeView: AppView = isAppView(params.view) ? params.view : "board";
  const selectedTaskId = params.taskId ?? null;
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
    pauseTracking,
    isTaskTracking,
    getTaskLiveMinutes,
    todayStats,
    setTasks,
  } = useTasks();

  useEffect(() => {
    localStorage.setItem("taskOrganizer.filter", filter);
  }, [filter]);

  useEffect(() => {
    if (isAppView(params.view)) return;
    navigate("/board", { replace: true });
  }, [navigate, params.view]);

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

  const zenRows = useMemo(() => {
    const activeTasks = tasks.filter((task) => !task.completedAt);
    return activeTasks
      .map((task) => {
        const isTracking = isTaskTracking(task.id);
        const hasTrackedTime = task.actualTimeMinutes > 0 || isTracking;
        return {
          task,
          project:
            task.projectId === null
              ? unassignedProject
              : (projects.find((project) => project.id === task.projectId) ??
                unassignedProject),
          isTracking,
          hasTrackedTime,
          liveMinutes: getTaskLiveMinutes(task.id),
          getTaskLiveMinutes,
        };
      })
      .filter((row) => row.hasTrackedTime);
  }, [tasks, projects, unassignedProject, isTaskTracking, getTaskLiveMinutes]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

  const completeTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.completedAt) return;
    toggleComplete(taskId);
  };

  const isTaskDrawerOpen = selectedTaskId !== null && selectedTask !== null;

  const handleCreateTaskFromList = () => {
    const nextTaskId = addTaskAtTop("New task", null);
    navigate(`/list/task/${encodeURIComponent(nextTaskId)}`);
  };

  const handleCreateTaskFromBoard = (projectId: string | null) => {
    const nextTaskId = addTaskAfterProject("New task", projectId);
    navigate(`/board/task/${encodeURIComponent(nextTaskId)}`);
  };

  const handleOpenTaskDetails = (taskId: string) => {
    navigate(`/${activeView}/task/${encodeURIComponent(taskId)}`);
  };

  const handleCloseTaskDetails = () => {
    navigate(`/${activeView}`);
  };

  const handleDeleteProject = (projectId: string) => {
    reorderProjects(projects.filter((project) => project.id !== projectId));
    const updatedTasks = tasks.map((task) =>
      task.projectId === projectId ? { ...task, projectId: null } : task,
    );
    setTasks(updatedTasks);
  };

  const handleChangeView = (view: AppView) => {
    navigate(`/${view}`);
  };

  useEffect(() => {
    if (!isZen || selectedTaskId) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        navigate("/list");
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isZen, navigate, selectedTaskId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div
        className={`group relative flex min-h-screen w-full flex-col ${
          isZen ? "px-6 py-0" : "gap-6 px-6 py-8"
        }`}
      >
        {isZen ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20">
            <div className="flex justify-end px-6 pt-4">
              <button
                type="button"
                onClick={() => navigate("/list")}
                className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-lg p-0 text-5xl leading-none font-light text-white opacity-0 transition group-hover:opacity-100 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Exit zen mode"
              >
                <X className="h-8 w-8" strokeWidth={2.75} aria-hidden="true" />
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
              rows={zenRows}
              onComplete={toggleComplete}
              onOpenDetails={handleOpenTaskDetails}
              onToggleTracking={toggleTracking}
            />
          ) : activeView === "board" ? (
            <BoardView
              projects={projects}
              unassignedProject={unassignedProject}
              tasks={filteredTasks}
              allTasks={tasks}
              onCreateTask={handleCreateTaskFromBoard}
              onCreateProject={createProject}
              onDeleteProject={handleDeleteProject}
              onReorderProjects={reorderProjects}
              onReorderProjectTasks={moveTaskInBoard}
              onToggleComplete={toggleComplete}
              onToggleTracking={toggleTracking}
              isTaskTracking={isTaskTracking}
              getTaskLiveMinutes={getTaskLiveMinutes}
              onDeleteTask={deleteTask}
              onUpdateTaskTitle={updateTaskTitle}
              onOpenTaskDetails={handleOpenTaskDetails}
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
              onCreateTask={handleCreateTaskFromList}
              onToggleTracking={toggleTracking}
              isTaskTracking={isTaskTracking}
              getTaskLiveMinutes={getTaskLiveMinutes}
              onOpenTaskDetails={handleOpenTaskDetails}
            />
          )}
        </div>
        <TaskDetailsDrawer
          isOpen={isTaskDrawerOpen}
          task={selectedTask}
          projects={projects}
          unassignedProject={unassignedProject}
          onClose={handleCloseTaskDetails}
          onDelete={deleteTask}
          onComplete={completeTask}
          onPauseTracking={pauseTracking}
          onToggleTracking={toggleTracking}
          isTaskTracking={isTaskTracking}
          getTaskLiveMinutes={getTaskLiveMinutes}
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
