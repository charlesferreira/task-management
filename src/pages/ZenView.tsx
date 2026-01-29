import { useEffect, useState } from 'react'
import type { Task } from '../models/types'

type ZenViewProps = {
  task: Task | null
  onComplete: (taskId: string) => void
}

const ZenView = ({ task, onComplete }: ZenViewProps) => {
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    setIsFading(false)
  }, [task?.id])

  const handleComplete = () => {
    if (!task) return
    setIsFading(true)
    window.setTimeout(() => {
      onComplete(task.id)
    }, 180)
  }

  return (
    <section className="group relative flex-1 w-full">
      {task ? (
        <div
          key={task.id}
          className={`absolute inset-0 flex items-center justify-center text-center transition-opacity duration-200 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex w-full max-w-4xl flex-col items-center gap-10 md:gap-12">
            <h2 className="text-4xl font-semibold leading-tight text-slate-900 md:text-6xl dark:text-slate-100">
              {task.title}
            </h2>
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-lg border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-600 opacity-0 shadow-sm transition hover:text-slate-900 group-hover:opacity-100 group-focus-within:opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              Mark complete
            </button>
          </div>
        </div>
      ) : (
        <p className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          No tasks available
        </p>
      )}
    </section>
  )
}

export default ZenView
