import { useRef, useState } from "react";
import { Download, Settings, Upload } from "lucide-react";
import BottomActionButton from "./BottomActionButton";

type BoardSettingsWidgetProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  layoutMode: "columns" | "grid";
  onChangeLayoutMode: (mode: "columns" | "grid") => void;
  onExportTasks: () => void;
  onImportTasks: (file: File) => Promise<string>;
};

const BoardSettingsWidget = ({
  isOpen,
  onToggle,
  onClose,
  layoutMode,
  onChangeLayoutMode,
  onExportTasks,
  onImportTasks,
}: BoardSettingsWidgetProps) => {
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    const message = await onImportTasks(file);
    setImportFeedback(message);
  };

  return (
    <BottomActionButton
      isOpen={isOpen}
      onToggle={onToggle}
      onClose={onClose}
      icon={<Settings className="h-6 w-6" strokeWidth={2.25} />}
      ariaLabel="Open board settings"
      title="Board settings"
      containerClassName="relative"
      panelClassName="absolute bottom-full left-0 mb-3 w-72 rounded-xl border border-slate-200/70 bg-white p-4 shadow-md dark:border-slate-800/70 dark:bg-slate-900"
    >
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Settings
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Customize your board experience
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Board layout
          </p>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => onChangeLayoutMode("columns")}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              layoutMode === "columns"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Columns
          </button>
          <button
            type="button"
            onClick={() => onChangeLayoutMode("grid")}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              layoutMode === "grid"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Grid
          </button>
        </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Data
          </p>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportTasks}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/70 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Export tasks"
            title="Export tasks"
          >
            <Download className="h-4.5 w-4.5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/70 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Import tasks"
            title="Import tasks"
          >
            <Upload className="h-4.5 w-4.5" strokeWidth={2.25} />
          </button>
        </div>
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            void handleImportFile(file);
            event.currentTarget.value = "";
          }}
        />
        {importFeedback ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {importFeedback}
          </p>
        ) : null}
      </div>
    </BottomActionButton>
  );
};

export default BoardSettingsWidget;
