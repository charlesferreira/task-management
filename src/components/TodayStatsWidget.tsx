import { useState } from 'react'

type TodayStatsWidgetProps = {
  tasksCompleted: number
  pointsCompleted: number
  effortMinutes: number
}

const TodayStatsWidget = ({
  tasksCompleted,
  pointsCompleted,
  effortMinutes,
}: TodayStatsWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const formattedEffortMinutes = Number.isInteger(effortMinutes)
    ? String(effortMinutes)
    : String(Math.round(effortMinutes * 100) / 100)

  return (
    <div className="fixed bottom-6 left-6 z-30">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-xs font-semibold tracking-widest text-slate-500 uppercase shadow-md backdrop-blur transition hover:border-slate-300 dark:border-slate-800/70 dark:bg-slate-900/95 dark:text-slate-400"
      >
        Today
      </button>
      {isOpen ? (
        <div className="mt-2 w-55 rounded-xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-md backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/95">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {tasksCompleted}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">done</p>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {pointsCompleted}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">points</p>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {formattedEffortMinutes}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">minutes</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default TodayStatsWidget
