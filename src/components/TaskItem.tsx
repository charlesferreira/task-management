import { useEffect, useState } from 'react'
import type { Project, Task } from '../models/types'
import ProjectBadge from './ProjectBadge'

type TaskItemProps = {
  task: Task
  project: Project
  isDragging?: boolean
  dragHandleProps?: {
    attributes: Record<string, unknown>
    listeners: Record<string, unknown>
    setActivatorNodeRef: (element: HTMLElement | null) => void
  }
  showProjectBadge?: boolean
  onToggleComplete?: (taskId: string) => void
  onDelete?: (taskId: string) => void
}

const TaskItem = ({
  task,
  project,
  isDragging = false,
  dragHandleProps,
  showProjectBadge = true,
  onToggleComplete,
  onDelete,
}: TaskItemProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setConfirmDelete(false)
  }, [task.id])

  return (
    <div
      ref={(element) => dragHandleProps?.setActivatorNodeRef(element)}
      className={`group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm ${
        dragHandleProps ? 'cursor-move' : ''
      }`}
      {...dragHandleProps?.attributes}
      {...dragHandleProps?.listeners}
    >
      {isDragging ? (
        <p className="text-sm font-medium text-slate-900">{task.title}</p>
      ) : (
        <>
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleComplete?.(task.id)}
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${
                  task.completedAt
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 text-transparent hover:text-slate-300'
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
                    ? 'text-slate-400 line-through'
                    : 'text-slate-900'
                }`}
              >
                {task.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showProjectBadge ? <ProjectBadge project={project} /> : null}
            {confirmDelete ? (
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => onDelete?.(task.id)}
                  className="rounded-full border border-rose-200 px-2 py-1 font-semibold text-rose-500"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full border border-slate-200 px-2 py-1 font-semibold text-slate-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex w-0 items-center justify-end overflow-hidden opacity-0 transition-[width,opacity] group-hover:w-16 group-hover:opacity-100 group-focus-within:w-16 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-400 hover:text-rose-500"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default TaskItem
