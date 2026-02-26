import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Project, Task } from '../models/types'
import ProjectBadge from './ProjectBadge'
import StoryPointsBadge from './StoryPointsBadge'
import TaskTimerButton from './TaskTimerButton'

type TaskItemProps = {
  task: Task
  project: Project
  isDragging?: boolean
  actionsVariant?: 'floating' | 'inline'
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners?: DraggableSyntheticListeners
    setActivatorNodeRef: (element: HTMLElement | null) => void
  }
  showProjectBadge?: boolean
  onToggleComplete?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onUpdateTitle?: (taskId: string, title: string) => void
  onOpenDetails?: (taskId: string) => void
  onToggleTracking?: (taskId: string) => void
  isTaskTracking?: (taskId: string) => boolean
  getTaskLiveMinutes?: (taskId: string) => number
}

const isInteractiveElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('button,input,textarea,select,a,[data-no-open-details]'))
}

const TaskItem = ({
  task,
  project,
  isDragging = false,
  dragHandleProps,
  showProjectBadge = true,
  onToggleComplete,
  onOpenDetails,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
}: TaskItemProps) => {
  const isTracking = isTaskTracking?.(task.id) ?? false
  const liveMinutes = getTaskLiveMinutes?.(task.id) ?? task.actualTimeMinutes
  const hasTrackedTime = task.actualTimeMinutes > 0 || isTracking

  return (
    <div
      data-task-card
      ref={dragHandleProps?.setActivatorNodeRef}
      className={`group/task relative flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 transition dark:bg-slate-900 ${
        dragHandleProps
          ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'
          : ''
      }`}
      {...dragHandleProps?.attributes}
      {...dragHandleProps?.listeners}
      onClick={(event) => {
        if (isDragging) return
        if (isInteractiveElement(event.target)) return
        onOpenDetails?.(task.id)
      }}
    >
      {isDragging ? (
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {task.title}
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                onToggleComplete?.(task.id)
              }}
              className={`flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-lg border text-xs leading-none transition ${
                task.completedAt
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300 text-transparent hover:text-slate-300 dark:border-slate-600 dark:hover:text-slate-500'
              }`}
              aria-label={
                task.completedAt ? 'Mark task incomplete' : 'Mark task complete'
              }
            >
              ✓
            </button>
            <p
              className={`text-sm font-medium ${
                task.completedAt
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </p>
            <StoryPointsBadge storyPoints={task.storyPoints} />
          </div>
          <div className="flex items-center gap-2">
            {onToggleTracking ? (
              <TaskTimerButton
                taskId={task.id}
                minutes={liveMinutes}
                isRunning={isTracking}
                getTaskLiveMinutes={getTaskLiveMinutes}
                onToggle={() => onToggleTracking(task.id)}
                alwaysVisible={hasTrackedTime}
                compact
              />
            ) : null}
            {showProjectBadge ? <ProjectBadge project={project} /> : null}
          </div>
        </>
      )}
    </div>
  )
}

export default TaskItem
