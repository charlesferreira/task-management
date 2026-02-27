import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type BottomActionButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: ReactNode;
  ariaLabel: string;
  title: string;
  containerClassName: string;
  panelClassName: string;
  children: ReactNode;
};

const BottomActionButton = ({
  isOpen,
  onToggle,
  onClose,
  icon,
  ariaLabel,
  title,
  containerClassName,
  panelClassName,
  children,
}: BottomActionButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  return (
    <div ref={containerRef} className={containerClassName}>
      {isOpen ? <div className={panelClassName}>{children}</div> : null}
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70 dark:text-slate-300 dark:hover:text-slate-100 dark:focus-visible:ring-slate-600/70 ${
          isOpen ? "text-slate-900 dark:text-slate-100" : ""
        }`}
        aria-label={ariaLabel}
        title={title}
      >
        {icon}
      </button>
    </div>
  );
};

export default BottomActionButton;
