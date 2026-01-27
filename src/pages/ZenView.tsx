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
    <section className="flex min-h-[60vh] items-center justify-center rounded-xl border border-slate-200/70 bg-white p-10 shadow-sm">
      {task ? (
        <div
          key={task.id}
          className={`flex w-full max-w-4xl flex-col items-center gap-8 text-center transition-opacity duration-200 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <h2 className="text-4xl font-semibold leading-tight text-slate-900 md:text-6xl">
            {task.title}
          </h2>
          <button
            type="button"
            onClick={handleComplete}
            className="rounded-lg border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:text-slate-900"
          >
            Mark complete
          </button>
        </div>
      ) : (
        <p className="text-sm font-semibold text-slate-500">
          No tasks available
        </p>
      )}
    </section>
  )
}

export default ZenView
