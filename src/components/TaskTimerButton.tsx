import { useEffect, useRef, useState } from 'react'
import { formatMinutesAsClock } from '../utils/timeFormat'

type TaskTimerButtonProps = {
  taskId?: string
  minutes: number
  isRunning: boolean
  getTaskLiveMinutes?: (taskId: string) => number
  onToggle: () => void
  alwaysVisible?: boolean
  compact?: boolean
  interactive?: boolean
  showLeadingIcon?: boolean
  dimWhenPaused?: boolean
}

const TaskTimerButton = ({
  taskId,
  minutes,
  isRunning,
  getTaskLiveMinutes,
  onToggle,
  alwaysVisible = false,
  compact = false,
  interactive = true,
  showLeadingIcon = true,
  dimWhenPaused = false,
}: TaskTimerButtonProps) => {
  const [hover, setHover] = useState(false)
  const [displayMinutes, setDisplayMinutes] = useState(minutes)
  const [, setRenderSecond] = useState(0)
  const animationFrameRef = useRef<number | null>(null)
  const lastSecondRef = useRef<number>(0)

  useEffect(() => {
    setDisplayMinutes(minutes)
  }, [minutes])

  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = null
      return
    }

    lastSecondRef.current = Math.floor(Date.now() / 1000)
    const loop = () => {
      const second = Math.floor(Date.now() / 1000)
      if (second !== lastSecondRef.current) {
        lastSecondRef.current = second
        if (taskId && getTaskLiveMinutes) {
          setDisplayMinutes(getTaskLiveMinutes(taskId))
        }
        setRenderSecond(second)
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
  }, [isRunning, taskId, getTaskLiveMinutes])

  return (
    <button
      type="button"
      data-no-open-details
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        if (!interactive) return
        onToggle()
      }}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white font-mono font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-slate-100 ${
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      } ${alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover/task:opacity-100'} ${
        dimWhenPaused && !isRunning ? 'opacity-65' : ''
      } ${interactive ? '' : 'cursor-default hover:border-slate-200/70 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:text-slate-200'}`}
      aria-label={isRunning ? 'Pause timer' : 'Start timer'}
    >
      {showLeadingIcon ? (
        <span className="inline-flex h-4 w-4 items-center justify-center text-current">
          {hover ? (
            isRunning ? (
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
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          )}
        </span>
      ) : null}
      <span>{formatMinutesAsClock(displayMinutes)}</span>
    </button>
  )
}

export default TaskTimerButton
