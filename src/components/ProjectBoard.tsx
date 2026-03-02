import { useMemo, useState } from "react";
import {
  closestCenter,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";
import type { Project, Task } from "../models/types";
import { UNASSIGNED_PROJECT_ID } from "../models/types";
import ProjectColumn from "./ProjectColumn";
import TaskDndProvider from "./TaskDndProvider";
import TaskItem from "./TaskItem";

const UNASSIGNED_DROP_KEY = "__unassigned__";
const PROJECT_DROP_PREFIX = "project-drop:";

const getProjectDropId = (projectId: string | null) =>
  `${PROJECT_DROP_PREFIX}${projectId ?? UNASSIGNED_DROP_KEY}`;

const parseProjectDropId = (dropId: string) => {
  if (!dropId.startsWith(PROJECT_DROP_PREFIX)) return undefined;
  const projectKey = dropId.slice(PROJECT_DROP_PREFIX.length);
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
  void onReorderProjects;
  void onReorderProjectTasks;
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
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
    const activeProjectId =
      taskPositions.positionByTaskId.get(activeId)?.projectId ?? null;
    if (activeProjectId === targetProjectId) {
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
    const pointerHits = pointerWithin(args);
    if (args.pointerCoordinates) {
      return pointerHits;
    }
    return closestCenter(args);
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
      onDragStart={(taskId) => setActiveTaskId(taskId)}
      onDragOver={(_, nextOverId) => setOverId(nextOverId)}
      onDragCancel={() => {
        setActiveTaskId(null);
        setOverId(null);
      }}
      renderDragOverlay={(activeId) => {
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
        setActiveTaskId(null);
        setOverId(null);
        handleDragEnd(dragActiveId, dragOverId);
      }}
    >
      {layoutMode === "columns" ? (
        <div className="h-full min-h-0 min-w-0 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full min-h-0 min-w-full w-max items-stretch gap-5 px-6 pb-1">
            {content}
          </div>
        </div>
      ) : (
        <div className="h-full min-h-0 min-w-0 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 5xl:grid-cols-7 6xl:grid-cols-8">
            {content}
          </div>
        </div>
      )}
    </TaskDndProvider>
  );
};

export default ProjectBoard;
