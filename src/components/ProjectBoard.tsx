import { useMemo, useState } from "react";
import {
  closestCenter,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import type { Project, Task } from "../models/types";
import { UNASSIGNED_PROJECT_ID } from "../models/types";
import ProjectColumn from "./ProjectColumn";
import TaskDndProvider from "./TaskDndProvider";
import TaskItem from "./TaskItem";

const UNASSIGNED_DROP_KEY = "__unassigned__";
const PROJECT_DROP_PREFIX = "project-drop:";
const PROJECT_SORT_PREFIX = "project-sort:";

const getProjectDropId = (projectId: string | null) =>
  `${PROJECT_DROP_PREFIX}${projectId ?? UNASSIGNED_DROP_KEY}`;

const getProjectSortId = (projectId: string | null) =>
  `${PROJECT_SORT_PREFIX}${projectId ?? UNASSIGNED_DROP_KEY}`;

const parseProjectDropId = (dropId: string) => {
  if (!dropId.startsWith(PROJECT_DROP_PREFIX)) return undefined;
  const projectKey = dropId.slice(PROJECT_DROP_PREFIX.length);
  return projectKey === UNASSIGNED_DROP_KEY ? null : projectKey;
};

const parseProjectSortId = (sortableId: string) => {
  if (!sortableId.startsWith(PROJECT_SORT_PREFIX)) return undefined;
  const projectKey = sortableId.slice(PROJECT_SORT_PREFIX.length);
  return projectKey === UNASSIGNED_DROP_KEY ? null : projectKey;
};

type ProjectBoardProps = {
  projects: Project[];
  unassignedProject: Project;
  tasks: Task[];
  allTasks: Task[];
  layoutMode: "columns" | "grid";
  onToggleComplete: (taskId: string) => void;
  onOpenProjectDetails: (projectId: string | null) => void;
  onOpenTaskDetails: (taskId: string) => void;
  onQuickAddTask: (projectId: string | null) => void;
  onReorderProjects: (projects: Project[], unassignedOrder?: number) => void;
  onReorderProjectTasks: (
    activeId: string,
    targetProjectId: string | null,
    targetIndex: number,
    visibleTaskIds: string[],
  ) => void;
};

type ProjectDragOverlayCardProps = {
  project: Project;
  taskCount: number;
};

const ProjectDragOverlayCard = ({
  project,
  taskCount,
}: ProjectDragOverlayCardProps) => {
  return (
    <div className="w-[min(24rem,calc(100vw-3rem))] rounded-xl border border-slate-200/70 bg-white px-5 pt-5 pb-5 shadow-2xl dark:border-slate-800/70 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {project.name} ({taskCount})
          </h3>
        </div>
      </div>
      <div className="mt-3 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-200/70 px-3 py-5 text-center text-sm text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
        {taskCount === 0 ? "No tasks to show" : `${taskCount} task${taskCount === 1 ? "" : "s"}`}
      </div>
    </div>
  );
};

const ProjectBoard = ({
  projects,
  unassignedProject,
  tasks,
  allTasks,
  layoutMode,
  onToggleComplete,
  onOpenProjectDetails,
  onOpenTaskDetails,
  onQuickAddTask,
  onReorderProjects,
  onReorderProjectTasks,
}: ProjectBoardProps) => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeProjectSortId, setActiveProjectSortId] = useState<string | null>(
    null,
  );
  const [overId, setOverId] = useState<string | null>(null);

  const orderedProjects = useMemo(
    () => [...projects].sort((a, b) => a.order - b.order),
    [projects],
  );

  const orderedColumns = useMemo(() => {
    const unassignedIndex = Math.max(
      0,
      Math.min(unassignedProject.order, orderedProjects.length),
    );
    const columns = [...orderedProjects];
    columns.splice(unassignedIndex, 0, unassignedProject);
    return columns;
  }, [orderedProjects, unassignedProject]);
  const projectSortIds = useMemo(
    () =>
      orderedColumns.map((project) =>
        getProjectSortId(
          project.id === UNASSIGNED_PROJECT_ID ? null : project.id,
        ),
      ),
    [orderedColumns],
  );

  const taskPositions = useMemo(() => {
    const positionByTaskId = new Map<
      string,
      { projectId: string | null; index: number }
    >();
    const countsByProjectId = new Map<string | null, number>();

    tasks.forEach((task) => {
      const projectId = task.projectId;
      const currentIndex = countsByProjectId.get(projectId) ?? 0;
      positionByTaskId.set(task.id, { projectId, index: currentIndex });
      countsByProjectId.set(projectId, currentIndex + 1);
    });

    return { positionByTaskId, countsByProjectId };
  }, [tasks]);

  const handleDragEnd = (activeId: string, overId: string) => {
    const activeProjectId = parseProjectSortId(activeId);
    if (activeProjectId !== undefined) {
      const overProjectId = parseProjectSortId(overId);
      if (overProjectId === undefined || overProjectId === activeProjectId) {
        return;
      }
      const activeIndex = orderedColumns.findIndex((project) =>
        project.id === UNASSIGNED_PROJECT_ID
          ? activeProjectId === null
          : project.id === activeProjectId,
      );
      const overIndex = orderedColumns.findIndex((project) =>
        project.id === UNASSIGNED_PROJECT_ID
          ? overProjectId === null
          : project.id === overProjectId,
      );
      if (activeIndex === -1 || overIndex === -1) return;

      const reorderedColumns = arrayMove(orderedColumns, activeIndex, overIndex);
      const nextUnassignedOrder = reorderedColumns.findIndex(
        (project) => project.id === UNASSIGNED_PROJECT_ID,
      );
      onReorderProjects(
        reorderedColumns
          .filter((project) => project.id !== UNASSIGNED_PROJECT_ID)
          .map((project) => ({ ...project })),
        nextUnassignedOrder,
      );
      return;
    }

    const overTaskPosition = taskPositions.positionByTaskId.get(overId);
    if (overTaskPosition) {
      onReorderProjectTasks(
        activeId,
        overTaskPosition.projectId,
        overTaskPosition.index,
        tasks.map((task) => task.id),
      );
      return;
    }

    const targetProjectId = parseProjectDropId(overId);
    if (targetProjectId === undefined) return;
    const activeTaskProjectId =
      taskPositions.positionByTaskId.get(activeId)?.projectId ?? null;
    if (activeTaskProjectId === targetProjectId) {
      return;
    }
    const targetIndex = taskPositions.countsByProjectId.get(targetProjectId) ?? 0;
    onReorderProjectTasks(
      activeId,
      targetProjectId,
      targetIndex,
      tasks.map((task) => task.id),
    );
  };

  const boardCollisionDetection: CollisionDetection = (args) => {
    const draggingProject = parseProjectSortId(String(args.active.id)) !== undefined;
    const allowedCollision = (id: string) =>
      draggingProject
        ? parseProjectSortId(id) !== undefined
        : parseProjectSortId(id) === undefined;
    const pointerHits = pointerWithin(args).filter((entry) =>
      allowedCollision(String(entry.id)),
    );
    if (args.pointerCoordinates) {
      return pointerHits;
    }
    return closestCenter(args).filter((entry) =>
      allowedCollision(String(entry.id)),
    );
  };

  const content = orderedColumns.map((project) => {
    const isUnassigned = project.id === UNASSIGNED_PROJECT_ID;
    const currentProjectId = isUnassigned ? null : project.id;
    const currentProjectDropId = getProjectDropId(currentProjectId);
    const activeTaskProjectId = activeTaskId
      ? (taskPositions.positionByTaskId.get(activeTaskId)?.projectId ?? null)
      : null;
    const projectTasks = tasks.filter((task) =>
      isUnassigned ? task.projectId === null : task.projectId === currentProjectId,
    );
    const activeCount = allTasks.filter(
      (task) =>
        (isUnassigned ? task.projectId === null : task.projectId === currentProjectId) &&
        !task.completedAt,
    ).length;
    let dropIndicatorIndex: number | null = null;

    if (activeTaskId && overId) {
      const overTaskPosition = taskPositions.positionByTaskId.get(overId);
      if (
        overTaskPosition &&
        overTaskPosition.projectId === currentProjectId &&
        overTaskPosition.projectId !== undefined
      ) {
        if (activeTaskProjectId !== currentProjectId) {
          dropIndicatorIndex = overTaskPosition.index;
        }
      } else {
        const targetProjectId = parseProjectDropId(overId);
        if (targetProjectId === currentProjectId) {
          if (activeTaskProjectId !== currentProjectId) {
            dropIndicatorIndex = projectTasks.length;
          }
        }
      }
    }

    return (
      <ProjectColumn
        key={project.id}
        project={project}
        tasks={projectTasks}
        isUnassigned={isUnassigned}
        fillWidth={layoutMode !== "columns"}
        activeCount={activeCount}
        dropId={getProjectDropId(isUnassigned ? null : project.id)}
        sortableId={getProjectSortId(isUnassigned ? null : project.id)}
        onToggleComplete={onToggleComplete}
        onOpenProjectDetails={onOpenProjectDetails}
        onOpenTaskDetails={onOpenTaskDetails}
        onQuickAddTask={onQuickAddTask}
        dropIndicatorIndex={dropIndicatorIndex}
        suppressShellDropState={
          Boolean(activeTaskId) &&
          activeTaskProjectId === currentProjectId &&
          overId === currentProjectDropId
        }
      />
    );
  });

  return (
    <TaskDndProvider
      collisionDetection={boardCollisionDetection}
      onDragStart={(activeId) => {
        if (parseProjectSortId(activeId) !== undefined) {
          setActiveProjectSortId(activeId);
          setActiveTaskId(null);
          setOverId(null);
          return;
        }
        setActiveProjectSortId(null);
        setActiveTaskId(activeId);
      }}
      onDragOver={(activeId, nextOverId) => {
        if (parseProjectSortId(activeId) !== undefined) {
          setOverId(null);
          return;
        }
        setOverId(nextOverId);
      }}
      onDragCancel={() => {
        setActiveProjectSortId(null);
        setActiveTaskId(null);
        setOverId(null);
      }}
      renderDragOverlay={(activeId) => {
        const activeOverlayProjectId = parseProjectSortId(activeId);
        if (activeOverlayProjectId !== undefined) {
          const overlayProject =
            activeOverlayProjectId === null
              ? unassignedProject
              : (orderedProjects.find((project) => project.id === activeOverlayProjectId) ??
                null);
          if (!overlayProject) return null;
          const overlayTaskCount = tasks.filter((task) =>
            activeOverlayProjectId === null
              ? task.projectId === null
              : task.projectId === activeOverlayProjectId,
          ).length;
          return (
            <ProjectDragOverlayCard
              project={overlayProject}
              taskCount={overlayTaskCount}
            />
          );
        }
        const task = tasks.find((entry) => entry.id === activeId);
        if (!task) return null;
        const project =
          task.projectId === null
            ? unassignedProject
            : (projects.find((entry) => entry.id === task.projectId) ??
              unassignedProject);

        return (
          <div className="w-[min(26rem,calc(100vw-3rem))] rounded-lg shadow-2xl">
            <TaskItem
              task={task}
              project={project}
              styleVariant="card"
              showProjectBadge={false}
              showCompleteToggle
            />
          </div>
        );
      }}
      onDragEnd={(dragActiveId, dragOverId) => {
        if (activeProjectSortId) {
          setActiveProjectSortId(null);
        }
        setActiveTaskId(null);
        setOverId(null);
        handleDragEnd(dragActiveId, dragOverId);
      }}
    >
      {layoutMode === "columns" ? (
        <div className="h-full min-h-0 min-w-0 overflow-x-auto overflow-y-hidden">
          <SortableContext
            items={projectSortIds}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex h-full min-h-0 min-w-full w-max items-stretch gap-5 px-6 pb-1">
              {content}
            </div>
          </SortableContext>
        </div>
      ) : (
        <div className="h-full min-h-0 min-w-0 overflow-y-auto px-6 pb-6">
          <SortableContext items={projectSortIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 5xl:grid-cols-7 6xl:grid-cols-8">
              {content}
            </div>
          </SortableContext>
        </div>
      )}
    </TaskDndProvider>
  );
};

export default ProjectBoard;
