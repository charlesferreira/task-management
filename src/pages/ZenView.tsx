import { useEffect, useRef, useState } from 'react'
import type { Project, Task } from '../models/types'

type ZenViewProps = {
  task: Task | null
  project: Project | null
  onOpenDetails: (taskId: string) => void
  onToggleTracking: (taskId: string) => void
  isTaskTracking: (taskId: string) => boolean
  getTaskLiveMinutes: (taskId: string) => number
}

const formatTimer = (minutes: number) => {
  const totalSeconds = Math.max(0, Math.floor(minutes * 60))
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0')
  const mins = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const secs = (totalSeconds % 60).toString().padStart(2, '0')
  return `${hours}:${mins}:${secs}`
}

const ZenView = ({
  task,
  project,
  onOpenDetails,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
}: ZenViewProps) => {
  const [timerHover, setTimerHover] = useState(false)
  const [, setRenderSecond] = useState(0)
  const animationFrameRef = useRef<number | null>(null)
  const lastSecondRef = useRef<number>(0)

  const taskId = task?.id ?? null
  const isTrackingCurrentTask = taskId ? isTaskTracking(taskId) : false

  useEffect(() => {
    if (!taskId || !isTrackingCurrentTask) {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = null
      return
    }

    lastSecondRef.current = Math.floor(Date.now() / 1000)

    const loop = () => {
      const nowSecond = Math.floor(Date.now() / 1000)
      if (nowSecond !== lastSecondRef.current) {
        lastSecondRef.current = nowSecond
        setRenderSecond(nowSecond)
      }
      animationFrameRef.current = window.requestAnimationFrame(loop)
    }

    animationFrameRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = null
    }
  }, [taskId, isTrackingCurrentTask])

  const liveMinutes = taskId ? getTaskLiveMinutes(taskId) : 0

  return (
    <section className="group relative w-full flex-1">
      {task ? (
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="flex w-full max-w-4xl flex-col items-center gap-8 md:gap-10">
            {project ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => onOpenDetails(task.id)}
              className="text-4xl leading-tight font-semibold text-slate-900 transition hover:opacity-80 md:text-6xl dark:text-slate-100"
            >
              {task.title}
            </button>

            <button
              type="button"
              onMouseEnter={() => setTimerHover(true)}
              onMouseLeave={() => setTimerHover(false)}
              onClick={() => onToggleTracking(task.id)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white px-3 py-1.5 font-mono text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-slate-100"
              aria-label={isTrackingCurrentTask ? 'Pause timer' : 'Start timer'}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center text-current">
                {timerHover ? (
                  isTrackingCurrentTask ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
                      <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M7 5.5v13c0 .9 1 1.5 1.8 1l9.7-6.5a1.2 1.2 0 0 0 0-2L8.8 4.5A1.2 1.2 0 0 0 7 5.5Z" />
                    </svg>
                  )
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                )}
              </span>
              <span>{formatTimer(liveMinutes)}</span>
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
