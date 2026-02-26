import { useEffect, useRef, useState } from 'react'
import { Clock3, Pause, Play } from 'lucide-react'
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
  forceToggleIcon?: boolean
  variant?: 'default' | 'zen'
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
  forceToggleIcon = false,
  variant = 'default',
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

  const isZen = variant === 'zen'
  const stateToneClass = !isZen && dimWhenPaused
    ? isRunning
      ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-400/20 dark:border-emerald-400/60 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-300/20'
      : 'border-slate-600/70 bg-slate-900/35 text-slate-400 opacity-70 dark:border-slate-700 dark:bg-slate-900/35 dark:text-slate-400'
    : ''
  const zenToneClass = isRunning
    ? 'text-slate-700 dark:text-slate-100'
    : 'text-slate-400 dark:text-slate-500'

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
        if (event.detail > 0) {
          event.currentTarget.blur()
        }
      }}
      className={`inline-flex items-center gap-2 rounded-lg font-mono font-semibold transition ${
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      } ${alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover/task:opacity-100'} ${
        stateToneClass
      } ${
        isZen
          ? `${zenToneClass} ${interactive ? 'hover:text-slate-900 dark:hover:text-slate-100' : ''}`
          : 'border border-slate-200/70 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-slate-100'
      } ${interactive ? '' : 'cursor-default'}`}
      aria-label={isRunning ? 'Pause timer' : 'Start timer'}
    >
      {showLeadingIcon ? (
        <span className="inline-flex h-4 w-4 items-center justify-center text-current">
          {forceToggleIcon || hover ? (
            isRunning ? (
              <Pause className="h-4 w-4" strokeWidth={2.6} />
            ) : (
              <Play className="h-4 w-4" strokeWidth={2.6} />
            )
          ) : (
            <Clock3 className="h-4 w-4" strokeWidth={2.2} />
          )}
        </span>
      ) : null}
      <span>{formatMinutesAsClock(displayMinutes)}</span>
    </button>
  )
}

export default TaskTimerButton
