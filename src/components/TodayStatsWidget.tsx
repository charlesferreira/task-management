import { BarChart3 } from "lucide-react";
import BottomActionButton from "./BottomActionButton";

type TodayStatsWidgetProps = {
  tasksCompleted: number;
  pointsCompleted: number;
  effortMinutes: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
};

const TodayStatsWidget = ({
  tasksCompleted,
  pointsCompleted,
  effortMinutes,
  isOpen,
  onToggle,
  onClose,
}: TodayStatsWidgetProps) => {
  const formattedEffortMinutes = Number.isInteger(effortMinutes)
    ? String(effortMinutes)
    : String(Math.round(effortMinutes * 100) / 100);

  return (
    <BottomActionButton
      isOpen={isOpen}
      onToggle={onToggle}
      onClose={onClose}
      icon={<BarChart3 className="h-6 w-6" strokeWidth={2.25} />}
      ariaLabel="Toggle today stats"
      title="Today stats"
      containerClassName="fixed bottom-6 left-6 z-30"
      panelClassName="absolute bottom-full left-0 mb-3 w-55 rounded-xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-md backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/95"
    >
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
    </BottomActionButton>
  );
};

export default TodayStatsWidget;
