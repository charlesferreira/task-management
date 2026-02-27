import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ArchivedFilterWidget from "./components/ArchivedFilterWidget";
import BoardSettingsWidget from "./components/BoardSettingsWidget";
import ProjectDetailsDrawer from "./components/ProjectDetailsDrawer";
import TaskDetailsDrawer from "./components/TaskDetailsDrawer";
import type { ThemeMode } from "./components/ThemeToggleButton";
import TodayStatsWidget from "./components/TodayStatsWidget";
import UndoToast from "./components/UndoToast";
import { useProjects } from "./hooks/useProjects";
import { useTasks } from "./hooks/useTasks";
import { UNASSIGNED_PROJECT_ID } from "./models/types";
import ProjectsView from "./pages/BoardView";
import TasksView from "./pages/ListView";
import TrackerView from "./pages/ZenView";

type AppView = "projects" | "tasks" | "tracker";
type UndoToastState = {
  id: number;
  message: string;
  onUndo: () => void;
  isClosing: boolean;
};
type BottomPanel = "today" | "settings";
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
  value === "projects" || value === "tasks" || value === "tracker";

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

const normalizeNameKey = (value: string) => value.trim().toLowerCase();

const generateEntityId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

function App() {
  const params = useParams();
  const navigate = useNavigate();
  const activeView: AppView = isAppView(params.view) ? params.view : "projects";
  const selectedTaskId = params.taskId ?? null;
  const isTracker = activeView === "tracker";
  const isProjects = activeView === "projects";

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("taskOrganizer.themeMode");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return "system";
  });
  const [boardLayoutMode, setBoardLayoutMode] = useState<"columns" | "grid">(
    () => {
      const stored = localStorage.getItem("taskOrganizer.boardLayoutMode");
      return stored === "grid" ? "grid" : "columns";
    },
  );
  const [pendingNewTaskDraft, setPendingNewTaskDraft] =
    useState<NewTaskDraftSnapshot | null>(null);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | null>(
    null,
  );
  const [undoToast, setUndoToast] = useState<UndoToastState | null>(null);
  const [openBottomPanel, setOpenBottomPanel] = useState<BottomPanel | null>(
    null,
  );
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const undoTimeoutRef = useRef<number | null>(null);
  const undoCloseTimeoutRef = useRef<number | null>(null);

  const {
    projects,
    unassignedProject,
    setProjects,
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
    addTaskAfterProject,
    moveTaskInBoard,
    reorderWithinProject,
    toggleComplete,
    deleteTask,
    deleteTasks,
    archiveTasks,
    unarchiveTasks,
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
    localStorage.setItem("taskOrganizer.themeMode", themeMode);
  }, [themeMode]);
  useEffect(() => {
    localStorage.setItem("taskOrganizer.boardLayoutMode", boardLayoutMode);
  }, [boardLayoutMode]);

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
    const legacyViewMap: Record<string, AppView> = {
      board: "projects",
      list: "tasks",
      zen: "tracker",
    };
    const mapped = params.view ? legacyViewMap[params.view] : null;
    if (mapped) {
      if (params.taskId) {
        navigate(`/${mapped}/task/${encodeURIComponent(params.taskId)}`, {
          replace: true,
        });
        return;
      }
      navigate(`/${mapped}`, { replace: true });
      return;
    }
    navigate("/projects", { replace: true });
  }, [navigate, params.taskId, params.view]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const useDark =
        themeMode === "dark" || (themeMode === "system" && media.matches);
      root.classList.toggle("dark", useDark);
      root.style.colorScheme =
        themeMode === "system" ? (media.matches ? "dark" : "light") : themeMode;
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [themeMode]);

  const filteredBoardTasks = useMemo(
    () =>
      tasks.filter((task) =>
        showArchivedOnly ? Boolean(task.archivedAt) : !task.archivedAt,
      ),
    [showArchivedOnly, tasks],
  );
  const filteredListTasks = useMemo(
    () =>
      tasks.filter((task) =>
        showArchivedOnly ? Boolean(task.archivedAt) : !task.archivedAt,
      ),
    [showArchivedOnly, tasks],
  );

  const zenRows = useMemo(() => {
    const activeTasks = tasks.filter(
      (task) => !task.completedAt && !task.archivedAt,
    );
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
    return (
      projects.find((project) => project.id === selectedProjectKey) ?? null
    );
  }, [projects, selectedProjectKey, unassignedProject]);
  const selectedProjectTasks = useMemo(() => {
    if (!selectedProject) return [];
    if (selectedProject.id === UNASSIGNED_PROJECT_ID) {
      return tasks.filter(
        (task) =>
          task.projectId === null &&
          (showArchivedOnly ? Boolean(task.archivedAt) : !task.archivedAt),
      );
    }
    return tasks.filter(
      (task) =>
        task.projectId === selectedProject.id &&
        (showArchivedOnly ? Boolean(task.archivedAt) : !task.archivedAt),
    );
  }, [selectedProject, showArchivedOnly, tasks]);

  const completeTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.completedAt) return;
    handleToggleComplete(taskId);
  };

  const isTaskDrawerOpen = selectedTaskId !== null && selectedTask !== null;

  const openNewTaskDraft = (
    title: string,
    projectId: string | null,
    view: AppView,
  ) => {
    if (pendingNewTaskDraft) {
      const existingDraft = tasks.find(
        (task) => task.id === pendingNewTaskDraft.id,
      );
      if (
        existingDraft &&
        isTaskSameAsDraftInitial(existingDraft, pendingNewTaskDraft)
      ) {
        if (
          existingDraft.title !== title ||
          existingDraft.projectId !== projectId
        ) {
          updateTaskDetails(existingDraft.id, {
            title,
            projectId,
            description: existingDraft.description,
            storyPoints: existingDraft.storyPoints,
            actualTimeMinutes: existingDraft.actualTimeMinutes,
          });
          setPendingNewTaskDraft(
            buildNewTaskSnapshot({
              id: existingDraft.id,
              title,
              projectId,
              description: existingDraft.description,
              storyPoints: existingDraft.storyPoints,
              actualTimeMinutes: existingDraft.actualTimeMinutes,
            }),
          );
        }
        navigate(`/${view}/task/${encodeURIComponent(existingDraft.id)}`);
        return;
      }
      setPendingNewTaskDraft(null);
    }

    const nextTaskId = addTaskAtTop(title, projectId);
    setPendingNewTaskDraft(
      buildNewTaskSnapshot({
        id: nextTaskId,
        title,
        projectId,
        description: "",
        storyPoints: null,
        actualTimeMinutes: 0,
      }),
    );
    navigate(`/${view}/task/${encodeURIComponent(nextTaskId)}`);
  };

  const handleCreateTaskFromList = () => {
    openNewTaskDraft("New task", null, "tasks");
  };

  const handleCreateTaskFromBoardProject = (projectId: string | null) => {
    if (selectedProject) {
      handleCloseProjectDetails();
    }
    if (activeView !== "projects") {
      navigate("/projects");
    }
    openNewTaskDraft("", projectId, "projects");
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

  const handleToggleTodayPanel = () => {
    setOpenBottomPanel((current) => (current === "today" ? null : "today"));
  };

  const handleCloseTodayPanel = () => {
    setOpenBottomPanel((current) => (current === "today" ? null : current));
  };

  const handleToggleSettingsPanel = () => {
    setOpenBottomPanel((current) =>
      current === "settings" ? null : "settings",
    );
  };

  const handleCloseSettingsPanel = () => {
    setOpenBottomPanel((current) => (current === "settings" ? null : current));
  };

  const handleToggleArchivedFilter = () => {
    setShowArchivedOnly((current) => !current);
    setOpenBottomPanel(null);
  };

  const handleExportTasks = () => {
    const projectMap = new Map(
      projects.map((project) => [project.id, project]),
    );
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      projects: projects
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((project) => ({
          name: project.name,
          color: project.color,
          order: project.order,
        })),
      tasks: tasks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((task) => ({
          title: task.title,
          projectName:
            task.projectId === null
              ? null
              : (projectMap.get(task.projectId)?.name ?? null),
          completedAt: task.completedAt,
          completedPointsSnapshot: task.completedPointsSnapshot,
          completedEffortSnapshotMinutes: task.completedEffortSnapshotMinutes,
          archivedAt: task.archivedAt,
          description: task.description,
          storyPoints: task.storyPoints,
          actualTimeMinutes: task.actualTimeMinutes,
          showInZen: task.showInZen,
        })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `task-organizer-export-${dateStamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleImportTasks = async (file: File): Promise<string> => {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as {
        projects?: Array<{ name?: unknown; color?: unknown }>;
        tasks?: Array<{
          title?: unknown;
          projectName?: unknown;
          completedAt?: unknown;
          completedPointsSnapshot?: unknown;
          completedEffortSnapshotMinutes?: unknown;
          archivedAt?: unknown;
          description?: unknown;
          storyPoints?: unknown;
          actualTimeMinutes?: unknown;
          showInZen?: unknown;
        }>;
      };

      const importedProjects = Array.isArray(parsed.projects)
        ? parsed.projects
        : [];
      const importedTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];

      const nextProjects = [...projects].sort((a, b) => a.order - b.order);
      const projectIdByName = new Map<string, string>();
      nextProjects.forEach((project) => {
        projectIdByName.set(normalizeNameKey(project.name), project.id);
      });

      let createdProjects = 0;
      let matchedProjects = 0;
      importedProjects.forEach((entry) => {
        const name = typeof entry.name === "string" ? entry.name.trim() : "";
        if (!name) return;
        const key = normalizeNameKey(name);
        if (projectIdByName.has(key)) {
          matchedProjects += 1;
          return;
        }
        const color =
          typeof entry.color === "string" && entry.color.trim()
            ? entry.color
            : "#94a3b8";
        const nextProject = {
          id: generateEntityId("project"),
          name,
          color,
          order: nextProjects.length,
        };
        nextProjects.push(nextProject);
        projectIdByName.set(key, nextProject.id);
        createdProjects += 1;
      });

      const allowedStoryPoints = new Set([1, 2, 3, 5, 8]);
      const importedTaskEntries = importedTasks
        .map((entry) => {
          const title =
            typeof entry.title === "string" ? entry.title.trim() : "";
          if (!title) return null;

          const projectName =
            typeof entry.projectName === "string"
              ? entry.projectName.trim()
              : "";
          const mappedProjectId = projectName
            ? (projectIdByName.get(normalizeNameKey(projectName)) ?? null)
            : null;
          const completedAt =
            typeof entry.completedAt === "string" ? entry.completedAt : null;
          const archivedAt =
            typeof entry.archivedAt === "string" ? entry.archivedAt : null;
          const description =
            typeof entry.description === "string" ? entry.description : "";
          const storyPoints =
            typeof entry.storyPoints === "number" &&
            allowedStoryPoints.has(entry.storyPoints)
              ? (entry.storyPoints as 1 | 2 | 3 | 5 | 8)
              : null;
          const actualTimeMinutes =
            typeof entry.actualTimeMinutes === "number" &&
            Number.isFinite(entry.actualTimeMinutes) &&
            entry.actualTimeMinutes > 0
              ? Math.round(entry.actualTimeMinutes * 100) / 100
              : 0;
          const showInZen =
            archivedAt === null && typeof entry.showInZen === "boolean"
              ? entry.showInZen
              : false;
          const completedPointsSnapshot =
            typeof entry.completedPointsSnapshot === "number" &&
            allowedStoryPoints.has(entry.completedPointsSnapshot)
              ? (entry.completedPointsSnapshot as 1 | 2 | 3 | 5 | 8)
              : null;
          const completedEffortSnapshotMinutes =
            typeof entry.completedEffortSnapshotMinutes === "number" &&
            Number.isFinite(entry.completedEffortSnapshotMinutes) &&
            entry.completedEffortSnapshotMinutes >= 0
              ? Math.round(entry.completedEffortSnapshotMinutes * 100) / 100
              : null;

          return {
            id: generateEntityId("task"),
            title,
            projectId: mappedProjectId,
            order: 0,
            completedAt,
            completedPointsSnapshot:
              completedAt === null
                ? null
                : (completedPointsSnapshot ?? storyPoints),
            completedEffortSnapshotMinutes:
              completedAt === null
                ? null
                : (completedEffortSnapshotMinutes ?? actualTimeMinutes),
            archivedAt,
            description,
            storyPoints,
            actualTimeMinutes,
            showInZen,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

      if (importedTaskEntries.length === 0 && createdProjects === 0) {
        return "No valid data found in this file.";
      }

      const nextTasks = [
        ...tasks,
        ...importedTaskEntries.map((task, index) => ({
          ...task,
          order: tasks.length + index,
        })),
      ];

      if (createdProjects > 0) {
        setProjects(nextProjects);
      }
      setTasks(nextTasks);

      return `Imported ${importedTaskEntries.length} tasks. Created ${createdProjects} projects and matched ${matchedProjects}.`;
    } catch {
      return "Import failed: invalid JSON file.";
    }
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

  const handleDeleteTasks = (taskIds: string[]) => {
    if (taskIds.length === 0) return;
    const snapshot = getTasksSnapshot();
    const deletedCount = deleteTasks(taskIds);
    if (deletedCount === 0) return;
    const label = deletedCount === 1 ? "task" : "tasks";
    showUndoToast(`${deletedCount} ${label} deleted`, () =>
      restoreTasksSnapshot(snapshot),
    );
  };

  const handleArchiveTasks = (taskIds: string[]) => {
    if (taskIds.length === 0) return;
    const snapshot = getTasksSnapshot();
    const archivedCount = archiveTasks(taskIds);
    if (archivedCount === 0) return;
    const label = archivedCount === 1 ? "task" : "tasks";
    showUndoToast(`${archivedCount} ${label} archived`, () =>
      restoreTasksSnapshot(snapshot),
    );
  };

  const handleUnarchiveTasks = (taskIds: string[]) => {
    if (taskIds.length === 0) return;
    const snapshot = getTasksSnapshot();
    const unarchivedCount = unarchiveTasks(taskIds);
    if (unarchivedCount === 0) return;
    const label = unarchivedCount === 1 ? "task" : "tasks";
    showUndoToast(`${unarchivedCount} ${label} restored`, () =>
      restoreTasksSnapshot(snapshot),
    );
  };

  const handleMoveTaskInBoard = (
    activeId: string,
    targetProjectId: string | null,
    targetIndex: number,
    visibleTaskIds: string[],
  ) => {
    const snapshot = getTasksSnapshot();
    const changed = moveTaskInBoard(
      activeId,
      targetProjectId,
      targetIndex,
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
    if (!isTracker || selectedTaskId) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        navigate("/tasks");
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isTracker, navigate, selectedTaskId]);

  return (
    <div
      className={`bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${
        isProjects ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <div
        className={`group relative flex w-full flex-col ${
          isTracker
            ? "min-h-screen px-6 py-0"
            : isProjects
              ? "h-full gap-6 overflow-hidden pt-8"
              : "min-h-screen gap-6 px-6 py-8"
        } ${isProjects ? "min-h-0" : ""}`}
      >
        {isTracker ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20">
            <div className="flex justify-end px-6 pt-4">
              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-lg p-0 text-5xl leading-none font-light text-slate-700 opacity-0 transition group-hover:opacity-100 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 dark:text-white dark:focus-visible:outline-white"
                aria-label="Exit tracker mode"
              >
                <X className="h-8 w-8" strokeWidth={2.75} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <header
            className={`flex flex-col gap-4 transition md:flex-row md:items-center md:justify-between ${
              isProjects ? "px-6" : ""
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
                  onClick={() => handleChangeView("tasks")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeView === "tasks"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  Tasks
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeView("projects")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeView === "projects"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  Projects
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeView("tracker")}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Tracker
                </button>
              </div>
            </div>
          </header>
        )}

        <div
          className={
            isTracker || isProjects ? "flex min-h-0 min-w-0 flex-1" : ""
          }
        >
          {activeView === "tracker" ? (
            <TrackerView
              rows={zenRows}
              onComplete={handleToggleComplete}
              onOpenDetails={handleOpenTaskDetails}
              onToggleTracking={toggleTracking}
            />
          ) : activeView === "projects" ? (
            <ProjectsView
              projects={projects}
              unassignedProject={unassignedProject}
              tasks={filteredBoardTasks}
              allTasks={filteredBoardTasks}
              layoutMode={boardLayoutMode}
              onCreateProject={createProject}
              onOpenProjectDetails={handleOpenProjectDetails}
              onReorderProjects={reorderProjects}
              onReorderProjectTasks={handleMoveTaskInBoard}
              onToggleComplete={handleToggleComplete}
              onOpenTaskDetails={handleOpenTaskDetails}
              onQuickAddTask={handleCreateTaskFromBoardProject}
              themeMode={themeMode}
              onToggleTheme={cycleThemeMode}
            />
          ) : (
            <TasksView
              projects={projects}
              unassignedProject={unassignedProject}
              tasks={filteredListTasks}
              showArchivedOnly={showArchivedOnly}
              onReorder={handleReorderVisibleTasks}
              onCreateTask={handleCreateTaskFromList}
              onArchiveTasks={handleArchiveTasks}
              onDeleteTasks={handleDeleteTasks}
              onUnarchiveTasks={handleUnarchiveTasks}
              onToggleComplete={handleToggleComplete}
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
          autoSelectTitle={Boolean(
            selectedTask &&
            pendingNewTaskDraft &&
            selectedTask.id === pendingNewTaskDraft.id,
          )}
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
          onCreateTask={(projectId, title) => {
            addTaskAfterProject(title, projectId);
          }}
          onDelete={handleDeleteProject}
        />
        {!isTracker ? (
          <div className="fixed bottom-6 left-6 z-30 flex items-end gap-2">
            <BoardSettingsWidget
              isOpen={openBottomPanel === "settings"}
              onToggle={handleToggleSettingsPanel}
              onClose={handleCloseSettingsPanel}
              layoutMode={boardLayoutMode}
              onChangeLayoutMode={setBoardLayoutMode}
              onExportTasks={handleExportTasks}
              onImportTasks={handleImportTasks}
            />
            <TodayStatsWidget
              tasksCompleted={todayStats.tasksCompleted}
              pointsCompleted={todayStats.pointsCompleted}
              effortMinutes={todayStats.effortMinutes}
              isOpen={openBottomPanel === "today"}
              onToggle={handleToggleTodayPanel}
              onClose={handleCloseTodayPanel}
            />
            <ArchivedFilterWidget
              isActive={showArchivedOnly}
              onToggle={handleToggleArchivedFilter}
            />
          </div>
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
