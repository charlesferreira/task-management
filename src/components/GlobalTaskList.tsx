import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo } from 'react'
import {
  UNASSIGNED_PROJECT,
  type Project,
  type Task,
} from '../models/types'
import TaskItem from './TaskItem'

type GlobalTaskListProps = {
  tasks: Task[]
  projects: Project[]
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

type SortableTaskItemProps = {
  task: Task
  project: Project
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

const SortableTaskItem = ({
  task,
  project,
  onToggleComplete,
  onDeleteTask,
}: SortableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <TaskItem
        task={task}
        project={project}
        isDragging={isDragging}
        dragHandleProps={{
          attributes,
          listeners,
          setActivatorNodeRef,
        }}
        onToggleComplete={onToggleComplete}
        onDelete={onDeleteTask}
      />
    </div>
  )
}

const GlobalTaskList = ({
  tasks,
  projects,
  onReorder,
  onToggleComplete,
  onDeleteTask,
}: GlobalTaskListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const projectMap = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project]))
  }, [projects])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(String(active.id), String(over.id), tasks.map((task) => task.id))
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Global Task List</h2>
      <p className="mt-1 text-sm text-slate-500">
        Drag tasks to reorder across all projects.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-4 flex flex-col gap-2.5">
            {tasks.map((task) => {
              const project =
                task.projectId === null
                  ? UNASSIGNED_PROJECT
                  : projectMap.get(task.projectId) ?? UNASSIGNED_PROJECT
              return (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  project={project}
                  onToggleComplete={onToggleComplete}
                  onDeleteTask={onDeleteTask}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default GlobalTaskList
