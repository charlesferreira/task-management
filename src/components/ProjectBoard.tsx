import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import type { Project, Task } from "../models/types";
import ProjectColumn from "./ProjectColumn";
import TaskItem from "./TaskItem";

type ProjectBoardProps = {
  projects: Project[];
  unassignedProject: Project;
  tasks: Task[];
  allTasks: Task[];
  onCreateTask: (projectId: string | null) => void;
  onDeleteProject: (projectId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleTracking: (taskId: string) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskTitle: (taskId: string, title: string) => void;
  onOpenTaskDetails: (taskId: string) => void;
  onUpdateProject: (
    projectId: string,
    updates: { name: string; color: string },
  ) => void;
  onUpdateUnassignedProjectName: (name: string) => void;
  onReorderProjects: (projects: Project[]) => void;
  onReorderProjectTasks: (
    activeId: string,
    overId: string | null,
    targetProjectId: string | null,
    visibleTaskIds: string[],
  ) => void;
};

type SortableProjectColumnProps = {
  project: Project;
  tasks: Task[];
  activeCount: number;
  onCreateTask: (projectId: string | null) => void;
  onDeleteProject: (projectId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleTracking: (taskId: string) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskTitle: (taskId: string, title: string) => void;
  onOpenTaskDetails: (taskId: string) => void;
  onUpdateProject: (
    projectId: string,
    updates: { name: string; color: string },
  ) => void;
};

const SortableProjectColumn = ({
  project,
  tasks,
  activeCount,
  onCreateTask,
  onDeleteProject,
  onToggleComplete,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
  onDeleteTask,
  onUpdateTaskTitle,
  onOpenTaskDetails,
  onUpdateProject,
}: SortableProjectColumnProps) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: { type: "column", projectId: project.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition ${isDragging ? "opacity-40" : ""}`}
    >
      <ProjectColumn
        project={project}
        tasks={tasks}
        activeCount={activeCount}
        onCreateTask={onCreateTask}
        onDeleteProject={onDeleteProject}
        onUpdateProject={onUpdateProject}
        onToggleComplete={onToggleComplete}
        onToggleTracking={onToggleTracking}
        isTaskTracking={isTaskTracking}
        getTaskLiveMinutes={getTaskLiveMinutes}
        onDeleteTask={onDeleteTask}
        onUpdateTaskTitle={onUpdateTaskTitle}
        onOpenTaskDetails={onOpenTaskDetails}
        headerDragProps={{
          attributes,
          listeners,
          setActivatorNodeRef,
        }}
      />
    </div>
  );
};

const ProjectBoard = ({
  projects,
  unassignedProject,
  tasks,
  allTasks,
  onCreateTask,
  onDeleteProject,
  onToggleComplete,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
  onDeleteTask,
  onUpdateTaskTitle,
  onOpenTaskDetails,
  onUpdateProject,
  onUpdateUnassignedProjectName,
  onReorderProjects,
  onReorderProjectTasks,
}: ProjectBoardProps) => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const orderedProjects = [...projects].sort((a, b) => a.order - b.order);
  const visibleTaskIds = tasks.map((task) => task.id);
  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const activeTask = activeTaskId
    ? (tasks.find((task) => task.id === activeTaskId) ?? null)
    : null;
  const activeProject =
    activeTask?.projectId === null
      ? unassignedProject
      : activeTask
        ? (projectMap.get(activeTask.projectId) ?? unassignedProject)
        : null;
  const activeColumnProject = activeProjectId
    ? (projectMap.get(activeProjectId) ?? null)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={(args) => {
        const activeType = args.active?.data.current?.type;
        if (activeType === "column") {
          const columnDroppables = args.droppableContainers.filter(
            (container) => {
              const type = container.data.current?.type;
              return type === "column" || type === "column-drop";
            },
          );
          return rectIntersection({
            ...args,
            droppableContainers:
              columnDroppables.length > 0
                ? columnDroppables
                : args.droppableContainers,
          });
        }
        return closestCenter(args);
      }}
      onDragStart={({ active }) => {
        if (active.data.current?.type === "task") {
          setActiveTaskId(String(active.id));
        }
        if (active.data.current?.type === "column") {
          setActiveProjectId(String(active.id));
        }
      }}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) {
          setActiveTaskId(null);
          setActiveProjectId(null);
          return;
        }
        const activeType = active.data.current?.type;
        const overType = over.data.current?.type;

        if (activeType === "column") {
          const targetProjectId =
            overType === "column-drop"
              ? over.data.current?.projectId
              : String(over.id);
          const oldIndex = orderedProjects.findIndex(
            (project) => project.id === active.id,
          );
          const newIndex = orderedProjects.findIndex(
            (project) => project.id === targetProjectId,
          );
          if (oldIndex === -1 || newIndex === -1) return;
          const updated = [...orderedProjects];
          const [moved] = updated.splice(oldIndex, 1);
          updated.splice(newIndex, 0, moved);
          onReorderProjects(updated);
          setActiveTaskId(null);
          setActiveProjectId(null);
          return;
        }

        if (activeType === "task") {
          const isOverColumn = overType === "column-drop";
          const targetProjectId = isOverColumn
            ? (over.data.current?.projectId ?? null)
            : (over.data.current?.projectId ?? null);
          const overTaskId = isOverColumn ? null : String(over.id);
          onReorderProjectTasks(
            String(active.id),
            overTaskId,
            targetProjectId ?? null,
            visibleTaskIds,
          );
        }
        setActiveTaskId(null);
        setActiveProjectId(null);
      }}
      onDragCancel={() => {
        setActiveTaskId(null);
        setActiveProjectId(null);
      }}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        <SortableContext
          items={orderedProjects.map((project) => project.id)}
          strategy={rectSortingStrategy}
        >
          {orderedProjects.map((project) => {
            const projectTasks = tasks.filter(
              (task) => task.projectId === project.id,
            );
            const activeCount = allTasks.filter(
              (task) => task.projectId === project.id && !task.completedAt,
            ).length;
            return (
              <SortableProjectColumn
                key={project.id}
                project={project}
                tasks={projectTasks}
                activeCount={activeCount}
                onCreateTask={onCreateTask}
                onDeleteProject={onDeleteProject}
                onToggleComplete={onToggleComplete}
                onToggleTracking={onToggleTracking}
                isTaskTracking={isTaskTracking}
                getTaskLiveMinutes={getTaskLiveMinutes}
                onDeleteTask={onDeleteTask}
                onUpdateTaskTitle={onUpdateTaskTitle}
                onOpenTaskDetails={onOpenTaskDetails}
                onUpdateProject={onUpdateProject}
              />
            );
          })}
        </SortableContext>
        <ProjectColumn
          project={unassignedProject}
          tasks={tasks.filter((task) => task.projectId === null)}
          isUnassigned
          activeCount={
            allTasks.filter(
              (task) => task.projectId === null && !task.completedAt,
            ).length
          }
          onCreateTask={onCreateTask}
          onToggleComplete={onToggleComplete}
          onToggleTracking={onToggleTracking}
          isTaskTracking={isTaskTracking}
          getTaskLiveMinutes={getTaskLiveMinutes}
          onDeleteTask={onDeleteTask}
          onUpdateTaskTitle={onUpdateTaskTitle}
          onOpenTaskDetails={onOpenTaskDetails}
          onUpdateUnassignedProjectName={onUpdateUnassignedProjectName}
        />
      </div>
      <DragOverlay adjustScale={false}>
        {activeTask && activeProject ? (
          <div className="w-70 rounded-lg bg-white shadow-md dark:bg-slate-900">
            <TaskItem
              task={activeTask}
              project={activeProject}
              showProjectBadge={false}
              isDragging
            />
          </div>
        ) : activeColumnProject ? (
          <div className="w-80 rounded-xl border border-slate-200/70 bg-white p-5 shadow-md dark:border-slate-800/70 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: activeColumnProject.color }}
              />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {activeColumnProject.name}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProjectBoard;
