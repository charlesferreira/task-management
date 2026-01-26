import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useRef, useState } from 'react'
import type { Project, Task } from '../models/types'
import { UNASSIGNED_PROJECT } from '../models/types'
import ProjectColumn from './ProjectColumn'
import TaskItem from './TaskItem'

type ProjectBoardProps = {
  projects: Project[]
  tasks: Task[]
  onAddTask: (title: string, projectId: string | null) => void
  onDeleteProject: (projectId: string) => void
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onUpdateProject: (
    projectId: string,
    updates: { name: string; color: string },
  ) => void
  onReorderProjects: (projects: Project[]) => void
  onReorderProjectTasks: (
    activeId: string,
    overId: string | null,
    targetProjectId: string | null,
    visibleTaskIds: string[],
  ) => void
}

type SortableProjectColumnProps = {
  project: Project
  tasks: Task[]
  onAddTask: (title: string, projectId: string | null) => void
  onDeleteProject: (projectId: string) => void
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onUpdateProject: (
    projectId: string,
    updates: { name: string; color: string },
  ) => void
}

const SortableProjectColumn = ({
  project,
  tasks,
  onAddTask,
  onDeleteProject,
  onToggleComplete,
  onDeleteTask,
  onUpdateProject,
}: SortableProjectColumnProps) => {
  const measureRef = useRef<HTMLDivElement | null>(null)
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
    data: { type: 'column', projectId: project.id },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-0' : ''}>
      <ProjectColumn
        project={project}
        tasks={tasks}
        onAddTask={onAddTask}
        onDeleteProject={onDeleteProject}
        onUpdateProject={onUpdateProject}
        onToggleComplete={onToggleComplete}
        onDeleteTask={onDeleteTask}
        dragHandle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            className={`flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/70 text-[10px] text-slate-400 transition hover:text-slate-700 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            aria-label="Drag project"
            {...attributes}
            {...listeners}
          >
            ::
          </button>
        }
      />
    </div>
  )
}

const ProjectBoard = ({
  projects,
  tasks,
  onAddTask,
  onDeleteProject,
  onToggleComplete,
  onDeleteTask,
  onUpdateProject,
  onReorderProjects,
  onReorderProjectTasks,
}: ProjectBoardProps) => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const orderedProjects = [...projects].sort((a, b) => a.order - b.order)
  const visibleTaskIds = tasks.map((task) => task.id)
  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  )
  const activeTask = activeTaskId
    ? tasks.find((task) => task.id === activeTaskId) ?? null
    : null
  const activeProject =
    activeTask?.projectId === null
      ? UNASSIGNED_PROJECT
      : activeTask
        ? projectMap.get(activeTask.projectId) ?? UNASSIGNED_PROJECT
        : null
  const activeColumnProject = activeProjectId
    ? projectMap.get(activeProjectId) ?? null
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        if (active.data.current?.type === 'task') {
          setActiveTaskId(String(active.id))
        }
        if (active.data.current?.type === 'column') {
          setActiveProjectId(String(active.id))
        }
      }}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) {
          setActiveTaskId(null)
          setActiveProjectId(null)
          return
        }
        const activeType = active.data.current?.type
        const overType = over.data.current?.type

        if (activeType === 'column') {
          const targetProjectId =
            overType === 'column-drop'
              ? over.data.current?.projectId
              : String(over.id)
          const oldIndex = orderedProjects.findIndex(
            (project) => project.id === active.id,
          )
          const newIndex = orderedProjects.findIndex(
            (project) => project.id === targetProjectId,
          )
          if (oldIndex === -1 || newIndex === -1) return
          const updated = [...orderedProjects]
          const [moved] = updated.splice(oldIndex, 1)
          updated.splice(newIndex, 0, moved)
          onReorderProjects(updated)
          setActiveTaskId(null)
          setActiveProjectId(null)
          return
        }

        if (activeType === 'task') {
          const isOverColumn = overType === 'column-drop'
          const targetProjectId = isOverColumn
            ? over.data.current?.projectId ?? null
            : over.data.current?.projectId ?? null
          const overTaskId = isOverColumn ? null : String(over.id)
          onReorderProjectTasks(
            String(active.id),
            overTaskId,
            targetProjectId ?? null,
            visibleTaskIds,
          )
        }
        setActiveTaskId(null)
        setActiveProjectId(null)
      }}
      onDragCancel={() => {
        setActiveTaskId(null)
        setActiveProjectId(null)
      }}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SortableContext
          items={orderedProjects.map((project) => project.id)}
          strategy={rectSortingStrategy}
        >
          {orderedProjects.map((project) => {
            const projectTasks = tasks.filter(
              (task) => task.projectId === project.id,
            )
            return (
              <SortableProjectColumn
                key={project.id}
                project={project}
                tasks={projectTasks}
                onAddTask={onAddTask}
                onDeleteProject={onDeleteProject}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onUpdateProject={onUpdateProject}
              />
            )
          })}
        </SortableContext>
        <ProjectColumn
          project={UNASSIGNED_PROJECT}
          tasks={tasks.filter((task) => task.projectId === null)}
          isUnassigned
          onAddTask={onAddTask}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
        />
      </div>
      <DragOverlay adjustScale={false}>
        {activeTask && activeProject ? (
          <div className="w-[280px] rounded-lg bg-white shadow-md">
            <TaskItem
              task={activeTask}
              project={activeProject}
              showProjectBadge={false}
              isDragging
            />
          </div>
        ) : activeColumnProject ? (
          <div className="w-[320px] rounded-xl border border-slate-200/70 bg-white p-5 shadow-md">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: activeColumnProject.color }}
              />
              <p className="text-sm font-semibold text-slate-900">
                {activeColumnProject.name}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default ProjectBoard
