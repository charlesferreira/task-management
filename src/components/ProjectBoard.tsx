import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import type { Project, Task } from "../models/types";
import { UNASSIGNED_PROJECT_ID } from "../models/types";
import ProjectColumn from "./ProjectColumn";
import TaskItem from "./TaskItem";

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
    overId: string | null,
    targetProjectId: string | null,
    visibleTaskIds: string[],
  ) => void;
};

type SortableProjectColumnProps = {
  project: Project;
  tasks: Task[];
  activeCount: number;
  isUnassigned?: boolean;
  fillWidth?: boolean;
  onToggleComplete: (taskId: string) => void;
  onOpenProjectDetails: (projectId: string | null) => void;
  onOpenTaskDetails: (taskId: string) => void;
  onQuickAddTask: (projectId: string | null) => void;
};

const SortableProjectColumn = ({
  project,
  tasks,
  activeCount,
  isUnassigned = false,
  fillWidth = false,
  onToggleComplete,
  onOpenProjectDetails,
  onOpenTaskDetails,
  onQuickAddTask,
}: SortableProjectColumnProps) => {
  const {
    attributes,
    listeners,
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
      {...attributes}
      {...listeners}
      className={`transition ${fillWidth ? "w-full min-w-0" : ""} ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <ProjectColumn
        project={project}
        tasks={tasks}
        isUnassigned={isUnassigned}
        fillWidth={fillWidth}
        activeCount={activeCount}
        onToggleComplete={onToggleComplete}
        onOpenProjectDetails={onOpenProjectDetails}
        onOpenTaskDetails={onOpenTaskDetails}
        onQuickAddTask={onQuickAddTask}
      />
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
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
    ? activeProjectId === UNASSIGNED_PROJECT_ID
      ? unassignedProject
      : (projectMap.get(activeProjectId) ?? null)
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
          const eligibleDroppables =
            columnDroppables.length > 0
              ? columnDroppables
              : args.droppableContainers;
          const pointerHits = pointerWithin({
            ...args,
            droppableContainers: eligibleDroppables,
          });
          if (pointerHits.length > 0) {
            return pointerHits;
          }
          if (layoutMode === "columns") {
            return rectIntersection({
              ...args,
              droppableContainers: eligibleDroppables,
            });
          }
          return closestCenter({
            ...args,
            droppableContainers: eligibleDroppables,
          });
        }
        if (activeType === "task") {
          const taskDroppables = args.droppableContainers.filter((container) => {
            const type = container.data.current?.type;
            return type === "task" || type === "column-drop";
          });
          const pointerHits = pointerWithin({
            ...args,
            droppableContainers: taskDroppables,
          });
          if (pointerHits.length > 0) {
            return pointerHits;
          }
          return closestCenter({
            ...args,
            droppableContainers: taskDroppables,
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
              ? ((over.data.current?.projectId ?? UNASSIGNED_PROJECT_ID) as
                  | string
                  | null)
              : String(over.id);
          const currentIds = orderedColumns.map((column) => column.id);
          const oldIndex = currentIds.findIndex((id) => id === String(active.id));
          const newIndex = currentIds.findIndex(
            (id) => id === String(targetProjectId),
          );
          if (oldIndex === -1 || newIndex === -1) return;
          const updatedIds = [...currentIds];
          const [movedId] = updatedIds.splice(oldIndex, 1);
          updatedIds.splice(newIndex, 0, movedId);

          const reorderedProjects = updatedIds
            .filter((id) => id !== UNASSIGNED_PROJECT_ID)
            .map((id) => orderedProjects.find((project) => project.id === id))
            .filter((project): project is Project => Boolean(project));
          const unassignedOrder = updatedIds.findIndex(
            (id) => id === UNASSIGNED_PROJECT_ID,
          );
          onReorderProjects(reorderedProjects, unassignedOrder);
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
      {layoutMode === "columns" ? (
        <div className="h-full min-h-0 min-w-0 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full min-h-0 min-w-full w-max items-stretch gap-5 px-6 pb-1">
            <SortableContext
              items={orderedColumns.map((project) => project.id)}
              strategy={horizontalListSortingStrategy}
            >
              {orderedColumns.map((project) => {
                const isUnassigned = project.id === UNASSIGNED_PROJECT_ID;
                const projectTasks = tasks.filter(
                  (task) =>
                    isUnassigned
                      ? task.projectId === null
                      : task.projectId === project.id,
                );
                const activeCount = allTasks.filter(
                  (task) =>
                    (isUnassigned
                      ? task.projectId === null
                      : task.projectId === project.id) && !task.completedAt,
                ).length;
                return (
                  <SortableProjectColumn
                    key={project.id}
                    project={project}
                    tasks={projectTasks}
                    activeCount={activeCount}
                    isUnassigned={isUnassigned}
                    onToggleComplete={onToggleComplete}
                    onOpenProjectDetails={onOpenProjectDetails}
                    onOpenTaskDetails={onOpenTaskDetails}
                    onQuickAddTask={onQuickAddTask}
                  />
                );
              })}
            </SortableContext>
          </div>
        </div>
      ) : (
        <div className="h-full min-h-0 min-w-0 overflow-y-auto px-6 pb-6">
          <SortableContext
            items={orderedColumns.map((project) => project.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 5xl:grid-cols-7 6xl:grid-cols-8">
              {orderedColumns.map((project) => {
                const isUnassigned = project.id === UNASSIGNED_PROJECT_ID;
                const projectTasks = tasks.filter((task) =>
                  isUnassigned ? task.projectId === null : task.projectId === project.id,
                );
                const activeCount = allTasks.filter(
                  (task) =>
                    (isUnassigned ? task.projectId === null : task.projectId === project.id) &&
                    !task.completedAt,
                ).length;
                return (
                  <SortableProjectColumn
                    key={project.id}
                    project={project}
                    tasks={projectTasks}
                    isUnassigned={isUnassigned}
                    fillWidth
                    activeCount={activeCount}
                    onToggleComplete={onToggleComplete}
                    onOpenProjectDetails={onOpenProjectDetails}
                    onOpenTaskDetails={onOpenTaskDetails}
                    onQuickAddTask={onQuickAddTask}
                  />
                );
              })}
            </div>
          </SortableContext>
        </div>
      )}
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
