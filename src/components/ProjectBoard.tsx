import { useMemo } from "react";
import type { Project, Task } from "../models/types";
import { UNASSIGNED_PROJECT_ID } from "../models/types";
import ProjectColumn from "./ProjectColumn";

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

  return layoutMode === "columns" ? (
    <div className="h-full min-h-0 min-w-0 overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-h-0 min-w-full w-max items-stretch gap-5 px-6 pb-1">
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
            <ProjectColumn
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
      </div>
    </div>
  ) : (
    <div className="h-full min-h-0 min-w-0 overflow-y-auto px-6 pb-6">
      <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 5xl:grid-cols-7 6xl:grid-cols-8">
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
            <ProjectColumn
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
    </div>
  );
};

export default ProjectBoard;
