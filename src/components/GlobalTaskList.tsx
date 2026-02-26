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
  type Project,
  type Task,
} from '../models/types'
import ProjectBadge from './ProjectBadge'
import StoryPointsBadge from './StoryPointsBadge'
import TaskTimerButton from './TaskTimerButton'

type GlobalTaskListProps = {
  tasks: Task[]
  projects: Project[]
  unassignedProject: Project
  hideHeader?: boolean
  filter?: 'all' | 'active' | 'completed'
  onFilterChange?: (mode: 'all' | 'active' | 'completed') => void
  completedCount?: number
  onDeleteCompleted?: () => void
  onReorder: (activeId: string, overId: string, visibleIds: string[]) => void
  onOpenTaskDetails: (taskId: string) => void
  onToggleTracking: (taskId: string) => void
  isTaskTracking: (taskId: string) => boolean
  getTaskLiveMinutes: (taskId: string) => number
}

type SortableTaskItemProps = {
  task: Task
  project: Project
  onOpenTaskDetails: (taskId: string) => void
  onToggleTracking: (taskId: string) => void
  isTaskTracking: (taskId: string) => boolean
  getTaskLiveMinutes: (taskId: string) => number
}

const SortableTaskItem = ({
  task,
  project,
  onOpenTaskDetails,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
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

  const isTracking = isTaskTracking(task.id)
  const liveMinutes = getTaskLiveMinutes(task.id)
  const hasTrackedTime = task.actualTimeMinutes > 0 || isTracking

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpenTaskDetails(task.id)}
      className={`group/task cursor-pointer border-b border-slate-200/70 transition last:border-b-0 hover:bg-white/30 dark:border-slate-800/70 dark:hover:bg-slate-800/30 ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      <td ref={setActivatorNodeRef} className="w-full px-2 py-3 align-middle">
        <span
          className={`block truncate text-sm font-medium ${
            task.completedAt
              ? 'text-slate-400 line-through dark:text-slate-500'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {task.title}
        </span>
      </td>
      <td className="w-px px-1 py-3 align-middle">
        <StoryPointsBadge storyPoints={task.storyPoints} />
      </td>
      <td className="w-px px-1 py-3 align-middle">
        <TaskTimerButton
          taskId={task.id}
          minutes={liveMinutes}
          isRunning={isTracking}
          getTaskLiveMinutes={getTaskLiveMinutes}
          onToggle={() => onToggleTracking(task.id)}
          alwaysVisible={hasTrackedTime}
          compact
        />
      </td>
      <td className="w-px px-2 py-3 align-middle">
        <ProjectBadge project={project} />
      </td>
    </tr>
  )
}

const GlobalTaskList = ({
  tasks,
  projects,
  unassignedProject,
  hideHeader = false,
  filter,
  onFilterChange,
  completedCount = 0,
  onDeleteCompleted,
  onReorder,
  onOpenTaskDetails,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
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
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
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
            className="rounded-lg border border-slate-200/70 px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800/70 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          >
            Delete completed
          </button>
        </div>
      ) : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <table className={`${hideHeader && !(filter && onFilterChange) ? '' : 'mt-4'} w-full table-auto`}>
            <tbody>
              {tasks.map((task) => {
                const project =
                  task.projectId === null
                    ? unassignedProject
                    : projectMap.get(task.projectId) ?? unassignedProject
                return (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    project={project}
                    onOpenTaskDetails={onOpenTaskDetails}
                    onToggleTracking={onToggleTracking}
                    isTaskTracking={isTaskTracking}
                    getTaskLiveMinutes={getTaskLiveMinutes}
                  />
                )
              })}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default GlobalTaskList
