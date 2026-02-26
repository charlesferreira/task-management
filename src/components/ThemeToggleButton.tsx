import { Moon, Settings, Sun } from "lucide-react";

export type ThemeMode = "system" | "light" | "dark";

type ThemeToggleButtonProps = {
  mode: ThemeMode;
  onToggle: () => void;
  className?: string;
};

const getThemeMeta = (mode: ThemeMode) => {
  if (mode === "light") {
    return {
      label: "Theme: Light. Click to switch to dark.",
      Icon: Sun,
    };
  }
  if (mode === "dark") {
    return {
      label: "Theme: Dark. Click to switch to system.",
      Icon: Moon,
    };
  }
  return {
    label: "Theme: System. Click to switch to light.",
    Icon: Settings,
  };
};

const ThemeToggleButton = ({
  mode,
  onToggle,
  className = "",
}: ThemeToggleButtonProps) => {
  const { label, Icon } = getThemeMeta(mode);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70 dark:text-slate-300 dark:hover:text-slate-100 dark:focus-visible:ring-slate-600/70 ${className}`}
    >
      <Icon className="h-6 w-6" strokeWidth={2.25} />
    </button>
  );
};

export default ThemeToggleButton;
