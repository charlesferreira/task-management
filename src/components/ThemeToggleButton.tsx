import { Moon, Sun } from "lucide-react";

export type ThemeMode = "system" | "light" | "dark";

type ThemeToggleButtonProps = {
  mode: ThemeMode;
  onToggle: () => void;
  className?: string;
};

const SystemContrastIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
    <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5z" fill="currentColor" />
  </svg>
);

const getThemeMeta = (mode: ThemeMode) => {
  if (mode === "light") {
    return {
      label: "Theme: Light. Click to switch to dark.",
      renderIcon: () => <Sun className="h-6 w-6" strokeWidth={2.25} />,
    };
  }
  if (mode === "dark") {
    return {
      label: "Theme: Dark. Click to switch to system.",
      renderIcon: () => <Moon className="h-6 w-6" strokeWidth={2.25} />,
    };
  }
  return {
    label: "Theme: System. Click to switch to light.",
    renderIcon: () => <SystemContrastIcon />,
  };
};

const ThemeToggleButton = ({
  mode,
  onToggle,
  className = "",
}: ThemeToggleButtonProps) => {
  const { label, renderIcon } = getThemeMeta(mode);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70 dark:text-slate-300 dark:hover:text-slate-100 dark:focus-visible:ring-slate-600/70 ${className}`}
    >
      {renderIcon()}
    </button>
  );
};

export default ThemeToggleButton;
