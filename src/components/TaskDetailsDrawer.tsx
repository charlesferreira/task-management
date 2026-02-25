import { useEffect, useState } from 'react'
import type { Task } from '../models/types'

type TaskDetailsDrawerProps = {
  isOpen: boolean
  task: Task | null
  todayStats: {
    tasksCompleted: number
    pointsCompleted: number
    effortMinutes: number
  }
  onClose: () => void
  onDelete: (taskId: string) => void
  onSave: (
    taskId: string,
    updates: {
      title: string
      description: string
      storyPoints: 1 | 2 | 3 | 5 | 8 | null
      actualTimeMinutes: number
    },
  ) => void
}

const storyPointOptions: Array<1 | 2 | 3 | 5 | 8> = [1, 2, 3, 5, 8]

type DrawerContentProps = {
  task: Task | null
  todayStats: {
    tasksCompleted: number
    pointsCompleted: number
    effortMinutes: number
  }
  onClose: () => void
  onDelete: (taskId: string) => void
  onSave: (
    taskId: string,
    updates: {
      title: string
      description: string
      storyPoints: 1 | 2 | 3 | 5 | 8 | null
      actualTimeMinutes: number
    },
  ) => void
}

const TaskDetailsDrawerContent = ({
  task,
  todayStats,
  onClose,
  onDelete,
  onSave,
}: DrawerContentProps) => {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [storyPoints, setStoryPoints] = useState<1 | 2 | 3 | 5 | 8 | null>(
    task?.storyPoints ?? null,
  )
  const [actualTimeMinutes, setActualTimeMinutes] = useState(
    String(task?.actualTimeMinutes ?? 0),
  )

  const parsedMinutes = Number.parseInt(actualTimeMinutes, 10)
  const sanitizedMinutes =
    Number.isFinite(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : 0

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Task details
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200/70 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300"
        >
          Close
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {!task ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a task to edit details.
          </p>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Title
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={!task}
            className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!task}
            rows={8}
            className="w-full resize-y rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
          />
        </label>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Story points
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStoryPoints(null)}
              disabled={!task}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                storyPoints === null
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  : 'border-slate-200/70 text-slate-500 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              none
            </button>
            {storyPointOptions.map((point) => (
              <button
                key={point}
                type="button"
                onClick={() => setStoryPoints(point)}
                disabled={!task}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                  storyPoints === point
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                    : 'border-slate-200/70 text-slate-500 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {point}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Actual time (minutes)
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={actualTimeMinutes}
            onChange={(event) => setActualTimeMinutes(event.target.value)}
            disabled={!task}
            className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
          />
        </label>

        <div className="rounded-xl border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-950">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Today
          </p>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {todayStats.tasksCompleted}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">done</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {todayStats.pointsCompleted}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">points</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {todayStats.effortMinutes}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">minutes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
        <button
          type="button"
          onClick={() => {
            if (!task) return
            onDelete(task.id)
            onClose()
          }}
          disabled={!task}
          className="mr-auto rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-40 dark:border-rose-500/40 dark:text-rose-400"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200/70 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (!task) return
            onSave(task.id, {
              title,
              description,
              storyPoints,
              actualTimeMinutes: sanitizedMinutes,
            })
            onClose()
          }}
          disabled={!task}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          Save
        </button>
      </div>
    </>
  )
}

const TaskDetailsDrawer = ({
  isOpen,
  task,
  todayStats,
  onClose,
  onDelete,
  onSave,
}: TaskDetailsDrawerProps) => {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/35 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-full max-w-xl border-l border-slate-200/70 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-slate-800/70 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
      >
        <div className="flex h-full flex-col">
          <TaskDetailsDrawerContent
            key={task?.id ?? 'no-task-selected'}
            task={task}
            todayStats={todayStats}
            onClose={onClose}
            onDelete={onDelete}
            onSave={onSave}
          />
        </div>
      </aside>
    </>
  )
}

export default TaskDetailsDrawer
