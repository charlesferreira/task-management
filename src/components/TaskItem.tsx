import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import type { Project, Task } from '../models/types'
import ProjectBadge from './ProjectBadge'

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
}

const TaskItem = ({
  task,
  project,
  isDragging = false,
  actionsVariant = 'floating',
  dragHandleProps,
  showProjectBadge = true,
  onToggleComplete,
  onDelete,
  onUpdateTitle,
}: TaskItemProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)

  useEffect(() => {
    setConfirmDelete(false)
    setIsEditing(false)
    setDraftTitle(task.title)
  }, [task.id])

  return (
    <div
      data-task-card
      ref={(element) => {
        if (!isEditing) {
          dragHandleProps?.setActivatorNodeRef(element)
        }
      }}
      className={`group/task relative flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 transition dark:bg-slate-900 ${
        dragHandleProps
          ? 'cursor-move hover:bg-slate-50 dark:hover:bg-slate-800'
          : ''
      }`}
      {...(!isEditing ? dragHandleProps?.attributes : {})}
      {...(!isEditing ? dragHandleProps?.listeners : {})}
    >
      {isDragging ? (
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {task.title}
        </p>
      ) : (
        <>
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleComplete?.(task.id)}
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
              {isEditing ? (
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onUpdateTitle?.(task.id, draftTitle)
                      setIsEditing(false)
                    }
                    if (event.key === 'Escape') {
                      setDraftTitle(task.title)
                      setIsEditing(false)
                    }
                  }}
                  onBlur={() => {
                    if (draftTitle.trim()) {
                      onUpdateTitle?.(task.id, draftTitle)
                    } else {
                      setDraftTitle(task.title)
                    }
                    setIsEditing(false)
                  }}
                  className="w-full rounded-lg border border-slate-200/70 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
                  autoFocus
                />
              ) : (
                <p
                  className={`text-sm font-medium ${
                    task.completedAt
                      ? 'text-slate-400 line-through dark:text-slate-500'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {task.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showProjectBadge ? <ProjectBadge project={project} /> : null}
            <div className="relative">
              {confirmDelete ? (
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => onDelete?.(task.id)}
                    className="rounded-lg border border-rose-200 px-2 py-1 font-semibold text-rose-500 dark:border-rose-500/40 dark:text-rose-400"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-slate-200/70 px-2 py-1 font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : isEditing ? null : (
                actionsVariant === 'floating' ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none transition-opacity group-hover/task:opacity-100 group-hover/task:pointer-events-auto">
                    <div className="flex items-center gap-1 rounded-lg bg-white/95 px-0.5 py-0.5 shadow-sm backdrop-blur dark:bg-slate-900/90">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg border border-slate-200/70 bg-white px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="rounded-lg border border-slate-200/70 bg-white px-2 py-1 text-xs font-semibold text-slate-500 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-0 items-center gap-1 overflow-hidden opacity-0 transition-[width,opacity] group-hover/task:w-[116px] group-hover/task:opacity-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="rounded-lg border border-slate-200/70 bg-white px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="rounded-lg border border-slate-200/70 bg-white px-2 py-1 text-xs font-semibold text-slate-500 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-rose-400"
                    >
                      Delete
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TaskItem
