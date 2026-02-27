import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type BottomActionButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: ReactNode;
  activeLabel?: string;
  ariaLabel: string;
  title: string;
  containerClassName?: string;
  panelClassName?: string;
  children?: ReactNode;
};

const BottomActionButton = ({
  isOpen,
  onToggle,
  onClose,
  icon,
  activeLabel,
  ariaLabel,
  title,
  containerClassName = "relative",
  panelClassName,
  children,
}: BottomActionButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasPanel = Boolean(children && panelClassName);

  useEffect(() => {
    if (!isOpen || !hasPanel) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [hasPanel, isOpen, onClose]);

  return (
    <div ref={containerRef} className={containerClassName}>
      {isOpen && hasPanel ? <div className={panelClassName}>{children}</div> : null}
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex h-12 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70 dark:focus-visible:ring-slate-600/70 ${
          activeLabel && isOpen
            ? "gap-1.5 rounded-lg border border-slate-300/70 bg-slate-100 px-3 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            : "w-12 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        }`}
        aria-label={ariaLabel}
        title={title}
      >
        {icon}
        {activeLabel && isOpen ? (
          <span className="text-sm font-semibold">{activeLabel}</span>
        ) : null}
      </button>
    </div>
  );
};

export default BottomActionButton;
