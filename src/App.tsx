import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import TaskDetailsDrawer from "./components/TaskDetailsDrawer";
import TodayStatsWidget from "./components/TodayStatsWidget";
import UndoToast from "./components/UndoToast";
import ProjectDetailsDrawer from "./components/ProjectDetailsDrawer";
import type { ThemeMode } from "./components/ThemeToggleButton";
import { UNASSIGNED_PROJECT_ID } from "./models/types";
import { useProjects } from "./hooks/useProjects";
import { useTasks } from "./hooks/useTasks";
import BoardView from "./pages/BoardView";
import ListView from "./pages/ListView";
import ZenView from "./pages/ZenView";

type AppView = "board" | "list" | "zen";
type UndoToastState = {
  id: number;
  message: string;
  onUndo: () => void;
  isClosing: boolean;
};
const UNASSIGNED_PROJECT_DRAWER_KEY = "__unassigned__";

type NewTaskDraftSnapshot = {
  id: string;
  initial: {
    title: string;
    projectId: string | null;
    description: string;
    storyPoints: 1 | 2 | 3 | 5 | 8 | null;
    actualTimeMinutes: number;
  };
};

const isAppView = (value: string | undefined): value is AppView =>
  value === "board" || value === "list" || value === "zen";

const buildNewTaskSnapshot = (task: {
  id: string;
  title: string;
  projectId: string | null;
  description: string;
  storyPoints: 1 | 2 | 3 | 5 | 8 | null;
  actualTimeMinutes: number;
}): NewTaskDraftSnapshot => ({
  id: task.id,
  initial: {
    title: task.title,
    projectId: task.projectId,
    description: task.description,
    storyPoints: task.storyPoints,
    actualTimeMinutes: task.actualTimeMinutes,
  },
});

const isTaskSameAsDraftInitial = (
  task: {
    title: string;
    projectId: string | null;
    description: string;
    storyPoints: 1 | 2 | 3 | 5 | 8 | null;
    actualTimeMinutes: number;
  },
  draft: NewTaskDraftSnapshot,
) =>
  task.title === draft.initial.title &&
  task.projectId === draft.initial.projectId &&
  task.description === draft.initial.description &&
  task.storyPoints === draft.initial.storyPoints &&
  task.actualTimeMinutes === draft.initial.actualTimeMinutes;

function App() {
  const params = useParams();
  const navigate = useNavigate();
  const activeView: AppView = isAppView(params.view) ? params.view : "board";
  const selectedTaskId = params.taskId ?? null;
  const isZen = activeView === "zen";
  const isBoard = activeView === "board";

  const [filter, setFilter] = useState<"all" | "active" | "completed">(() => {
    const stored = localStorage.getItem("taskOrganizer.filter");
    if (stored === "active" || stored === "completed" || stored === "all") {
      return stored;
    }
    return "all";
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("taskOrganizer.themeMode");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return "system";
  });
  const [pendingNewTaskDraft, setPendingNewTaskDraft] =
    useState<NewTaskDraftSnapshot | null>(null);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | null>(
    null,
  );
  const [undoToast, setUndoToast] = useState<UndoToastState | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);
  const undoCloseTimeoutRef = useRef<number | null>(null);

  const {
    projects,
    unassignedProject,
    createProject,
    reorderProjects,
    updateProject,
    updateUnassignedProjectName,
    getSnapshot: getProjectsSnapshot,
    restoreSnapshot: restoreProjectsSnapshot,
  } = useProjects();
  const {
    tasks,
    reorderVisibleTasks,
    addTaskAtTop,
    moveTaskInBoard,
    reorderWithinProject,
    toggleComplete,
    deleteTask,
    deleteCompleted,
    updateTaskTitle,
    updateTaskDetails,
    toggleTracking,
    setTaskZenVisibility,
    pauseTracking,
    isTaskTracking,
    getTaskLiveMinutes,
    todayStats,
    setTasks,
    getSnapshot: getTasksSnapshot,
    restoreSnapshot: restoreTasksSnapshot,
  } = useTasks();

  useEffect(() => {
    localStorage.setItem("taskOrganizer.filter", filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem("taskOrganizer.themeMode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current !== null) {
        window.clearTimeout(undoTimeoutRef.current);
      }
      if (undoCloseTimeoutRef.current !== null) {
        window.clearTimeout(undoCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAppView(params.view)) return;
    navigate("/board", { replace: true });
  }, [navigate, params.view]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const useDark = themeMode === "dark" || (themeMode === "system" && media.matches);
      root.classList.toggle("dark", useDark);
      root.style.colorScheme =
        themeMode === "system" ? (media.matches ? "dark" : "light") : themeMode;
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [themeMode]);

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
        return {
          task,
          project:
            task.projectId === null
              ? unassignedProject
              : (projects.find((project) => project.id === task.projectId) ??
                unassignedProject),
          isTracking: isTaskTracking(task.id),
          liveMinutes: getTaskLiveMinutes(task.id),
          getTaskLiveMinutes,
        };
      })
      .filter((row) => row.task.showInZen);
  }, [tasks, projects, unassignedProject, isTaskTracking, getTaskLiveMinutes]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );
  const selectedProject = useMemo(() => {
    if (!selectedProjectKey) return null;
    if (selectedProjectKey === UNASSIGNED_PROJECT_DRAWER_KEY) {
      return unassignedProject;
    }
    return projects.find((project) => project.id === selectedProjectKey) ?? null;
  }, [projects, selectedProjectKey, unassignedProject]);
  const selectedProjectTasks = useMemo(() => {
    if (!selectedProject) return [];
    if (selectedProject.id === UNASSIGNED_PROJECT_ID) {
      return tasks.filter((task) => task.projectId === null);
    }
    return tasks.filter((task) => task.projectId === selectedProject.id);
  }, [selectedProject, tasks]);

  const completeTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.completedAt) return;
    handleToggleComplete(taskId);
  };

  const isTaskDrawerOpen = selectedTaskId !== null && selectedTask !== null;

  const handleCreateTaskFromList = () => {
    if (pendingNewTaskDraft) {
      const existingDraft = tasks.find((task) => task.id === pendingNewTaskDraft.id);
      if (existingDraft && isTaskSameAsDraftInitial(existingDraft, pendingNewTaskDraft)) {
        navigate(`/list/task/${encodeURIComponent(existingDraft.id)}`);
        return;
      }
      setPendingNewTaskDraft(null);
    }
    const nextTaskId = addTaskAtTop("New task", null);
    setPendingNewTaskDraft(
      buildNewTaskSnapshot({
        id: nextTaskId,
        title: "New task",
        projectId: null,
        description: "",
        storyPoints: null,
        actualTimeMinutes: 0,
      }),
    );
    navigate(`/list/task/${encodeURIComponent(nextTaskId)}`);
  };

  const handleOpenTaskDetails = (taskId: string) => {
    navigate(`/${activeView}/task/${encodeURIComponent(taskId)}`);
  };

  const handleOpenProjectDetails = (projectId: string | null) => {
    setSelectedProjectKey(
      projectId === null ? UNASSIGNED_PROJECT_DRAWER_KEY : projectId,
    );
  };

  const handleCloseProjectDetails = () => {
    setSelectedProjectKey(null);
  };

  const handleCloseTaskDetails = () => {
    if (
      selectedTask &&
      pendingNewTaskDraft &&
      selectedTask.id === pendingNewTaskDraft.id
    ) {
      if (isTaskSameAsDraftInitial(selectedTask, pendingNewTaskDraft)) {
        deleteTask(selectedTask.id);
      }
      setPendingNewTaskDraft(null);
    }
    navigate(`/${activeView}`);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((entry) => entry.id === projectId);
    if (!project) return;
    const tasksSnapshot = getTasksSnapshot();
    const projectsSnapshot = getProjectsSnapshot();
    reorderProjects(projects.filter((project) => project.id !== projectId));
    const updatedTasks = tasks.map((task) =>
      task.projectId === projectId ? { ...task, projectId: null } : task,
    );
    setTasks(updatedTasks);
    showUndoToast("Project deleted", () => {
      restoreProjectsSnapshot(projectsSnapshot);
      restoreTasksSnapshot(tasksSnapshot);
    });
  };

  const handleChangeView = (view: AppView) => {
    navigate(`/${view}`);
  };

  const cycleThemeMode = () => {
    setThemeMode((current) => {
      if (current === "system") return "light";
      if (current === "light") return "dark";
      return "system";
    });
  };

  const closeUndoToast = () => {
    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (undoCloseTimeoutRef.current !== null) {
      window.clearTimeout(undoCloseTimeoutRef.current);
      undoCloseTimeoutRef.current = null;
    }
    setUndoToast((current) => {
      if (!current) return null;
      if (current.isClosing) return current;
      return { ...current, isClosing: true };
    });
    undoCloseTimeoutRef.current = window.setTimeout(() => {
      setUndoToast(null);
      undoCloseTimeoutRef.current = null;
    }, 220);
  };

  const dismissUndoToast = () => {
    closeUndoToast();
  };

  const showUndoToast = (message: string, onUndo: () => void) => {
    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current);
    }
    if (undoCloseTimeoutRef.current !== null) {
      window.clearTimeout(undoCloseTimeoutRef.current);
      undoCloseTimeoutRef.current = null;
    }
    setUndoToast({
      id: Date.now(),
      message,
      onUndo,
      isClosing: false,
    });
    undoTimeoutRef.current = window.setTimeout(() => {
      closeUndoToast();
    }, 8000);
  };

  const handleUndo = () => {
    if (!undoToast) return;
    const undo = undoToast.onUndo;
    closeUndoToast();
    undo();
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find((entry) => entry.id === taskId);
    if (!task) return;
    const wasCompleted = Boolean(task.completedAt);
    const snapshot = getTasksSnapshot();
    const changed = toggleComplete(taskId);
    if (!changed) return;
    if (!wasCompleted) {
      showUndoToast("Task completed", () => restoreTasksSnapshot(snapshot));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((entry) => entry.id === taskId);
    if (!task) return;
    const snapshot = getTasksSnapshot();
    const changed = deleteTask(taskId);
    if (!changed) return;
    showUndoToast("Task deleted", () => restoreTasksSnapshot(snapshot));
  };

  const handleMoveTaskInBoard = (
    activeId: string,
    overId: string | null,
    targetProjectId: string | null,
    visibleTaskIds: string[],
  ) => {
    const snapshot = getTasksSnapshot();
    const changed = moveTaskInBoard(
      activeId,
      overId,
      targetProjectId,
      visibleTaskIds,
    );
    if (!changed) return;
    showUndoToast("Task moved", () => restoreTasksSnapshot(snapshot));
  };

  const handleReorderVisibleTasks = (
    activeId: string,
    overId: string,
    visibleTaskIds: string[],
  ) => {
    const snapshot = getTasksSnapshot();
    const changed = reorderVisibleTasks(activeId, overId, visibleTaskIds);
    if (!changed) return;
    showUndoToast("Task moved", () => restoreTasksSnapshot(snapshot));
  };

  const handleReorderWithinProject = (
    projectId: string | null,
    activeId: string,
    overId: string,
    visibleTaskIds: string[],
  ) => {
    const snapshot = getTasksSnapshot();
    const changed = reorderWithinProject(
      projectId,
      visibleTaskIds,
      activeId,
      overId,
    );
    if (!changed) return;
    showUndoToast("Task moved", () => restoreTasksSnapshot(snapshot));
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
    <div
      className={`bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${
        isBoard ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <div
        className={`group relative flex w-full flex-col ${
          isZen
            ? "min-h-screen px-6 py-0"
            : isBoard
              ? "h-full gap-6 overflow-hidden pt-8"
              : "min-h-screen gap-6 px-6 py-8"
        } ${
          isBoard ? "min-h-0" : ""
        }`}
      >
        {isZen ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20">
            <div className="flex justify-end px-6 pt-4">
              <button
                type="button"
                onClick={() => navigate("/list")}
                className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-lg p-0 text-5xl leading-none font-light text-slate-700 opacity-0 transition group-hover:opacity-100 hover:opacity-80 dark:text-white dark:focus-visible:outline-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                aria-label="Exit zen mode"
              >
                <X className="h-8 w-8" strokeWidth={2.75} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <header
            className={`flex flex-col gap-4 transition md:flex-row md:items-center md:justify-between ${
              isBoard ? "px-6" : ""
            }`}
          >
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

        <div className={isZen || isBoard ? "flex flex-1 min-h-0 min-w-0" : ""}>
          {activeView === "zen" ? (
            <ZenView
              rows={zenRows}
              onComplete={handleToggleComplete}
              onOpenDetails={handleOpenTaskDetails}
              onToggleTracking={toggleTracking}
            />
          ) : activeView === "board" ? (
            <BoardView
              projects={projects}
              unassignedProject={unassignedProject}
              tasks={filteredTasks}
              allTasks={tasks}
              onCreateProject={createProject}
              onDeleteProject={handleDeleteProject}
              onOpenProjectDetails={handleOpenProjectDetails}
              onReorderProjects={reorderProjects}
              onReorderProjectTasks={handleMoveTaskInBoard}
              onToggleComplete={handleToggleComplete}
              onToggleTracking={toggleTracking}
              isTaskTracking={isTaskTracking}
              getTaskLiveMinutes={getTaskLiveMinutes}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskTitle={updateTaskTitle}
              onOpenTaskDetails={handleOpenTaskDetails}
              themeMode={themeMode}
              onToggleTheme={cycleThemeMode}
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
              onReorder={handleReorderVisibleTasks}
              onCreateTask={handleCreateTaskFromList}
              isTaskTracking={isTaskTracking}
              getTaskLiveMinutes={getTaskLiveMinutes}
              onSetZenVisibility={setTaskZenVisibility}
              onOpenTaskDetails={handleOpenTaskDetails}
              themeMode={themeMode}
              onToggleTheme={cycleThemeMode}
            />
          )}
        </div>
        <TaskDetailsDrawer
          isOpen={isTaskDrawerOpen}
          task={selectedTask}
          autoSelectTitle={
            Boolean(
              selectedTask &&
                pendingNewTaskDraft &&
                selectedTask.id === pendingNewTaskDraft.id,
            )
          }
          projects={projects}
          unassignedProject={unassignedProject}
          onClose={handleCloseTaskDetails}
          onDelete={handleDeleteTask}
          onComplete={completeTask}
          onPauseTracking={pauseTracking}
          onToggleTracking={toggleTracking}
          isTaskTracking={isTaskTracking}
          getTaskLiveMinutes={getTaskLiveMinutes}
          onSave={updateTaskDetails}
        />
        <ProjectDetailsDrawer
          key={selectedProject?.id ?? "project-drawer-empty"}
          isOpen={selectedProject !== null}
          project={selectedProject}
          tasks={selectedProjectTasks}
          onClose={handleCloseProjectDetails}
          onOpenTaskDetails={handleOpenTaskDetails}
          onSave={updateProject}
          onReorderTasks={(activeId, overId, visibleIds) =>
            handleReorderWithinProject(
              selectedProject?.id === UNASSIGNED_PROJECT_ID
                ? null
                : (selectedProject?.id ?? null),
              activeId,
              overId,
              visibleIds,
            )
          }
          isTaskTracking={isTaskTracking}
          getTaskLiveMinutes={getTaskLiveMinutes}
          onSaveUnassignedName={updateUnassignedProjectName}
          onDelete={handleDeleteProject}
        />
        {!isZen ? (
          <TodayStatsWidget
            tasksCompleted={todayStats.tasksCompleted}
            pointsCompleted={todayStats.pointsCompleted}
            effortMinutes={todayStats.effortMinutes}
          />
        ) : null}
        {undoToast ? (
          <UndoToast
            key={undoToast.id}
            message={undoToast.message}
            onUndo={handleUndo}
            onDismiss={dismissUndoToast}
            isClosing={undoToast.isClosing}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;
