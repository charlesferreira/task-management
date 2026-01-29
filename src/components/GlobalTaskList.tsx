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
  hideHeader?: boolean
  filter?: 'all' | 'active' | 'completed'
  onFilterChange?: (mode: 'all' | 'active' | 'completed') => void
  completedCount?: number
  onDeleteCompleted?: () => void
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onUpdateTaskTitle: (taskId: string, title: string) => void
}

type SortableTaskItemProps = {
  task: Task
  project: Project
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onUpdateTaskTitle: (taskId: string, title: string) => void
}

const SortableTaskItem = ({
  task,
  project,
  onToggleComplete,
  onDeleteTask,
  onUpdateTaskTitle,
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
      className={`transition-shadow ${isDragging ? 'shadow-md' : ''}`}
    >
      <TaskItem
        task={task}
        project={project}
        isDragging={isDragging}
        actionsVariant="inline"
        dragHandleProps={{
          attributes,
          listeners,
          setActivatorNodeRef,
        }}
        onToggleComplete={onToggleComplete}
        onDelete={onDeleteTask}
        onUpdateTitle={onUpdateTaskTitle}
      />
    </div>
  )
}

const GlobalTaskList = ({
  tasks,
  projects,
  hideHeader = false,
  filter,
  onFilterChange,
  completedCount = 0,
  onDeleteCompleted,
  onReorder,
  onToggleComplete,
  onDeleteTask,
  onUpdateTaskTitle,
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
    <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
      {hideHeader ? null : (
        <>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Global Task List
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag tasks to reorder across all projects.
          </p>
        </>
      )}
      {filter && onFilterChange ? (
        <div className={`${hideHeader ? '' : 'mt-4'} flex flex-wrap items-center gap-2`}>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white p-1 dark:border-slate-800/70 dark:bg-slate-900">
            {(['all', 'active', 'completed'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onFilterChange(mode)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                  filter === mode
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onDeleteCompleted}
            disabled={completedCount === 0}
            className="rounded-lg border border-slate-200/70 px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800/70 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          >
            Delete completed
          </button>
        </div>
      ) : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div
            className={`${
              hideHeader && !(filter && onFilterChange) ? '' : 'mt-4'
            } flex flex-col divide-y divide-slate-200/70 dark:divide-slate-800/70`}
          >
            {tasks.map((task) => {
              const project =
                task.projectId === null
                  ? UNASSIGNED_PROJECT
                  : projectMap.get(task.projectId) ?? UNASSIGNED_PROJECT
              return (
                <div key={task.id} className="py-1">
                  <SortableTaskItem
                    task={task}
                    project={project}
                    onToggleComplete={onToggleComplete}
                    onDeleteTask={onDeleteTask}
                    onUpdateTaskTitle={onUpdateTaskTitle}
                  />
                </div>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default GlobalTaskList
