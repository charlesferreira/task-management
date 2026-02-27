import { useRef, useState } from "react";
import { Settings } from "lucide-react";
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
      containerClassName="fixed bottom-6 left-20 z-30"
      panelClassName="absolute bottom-full left-0 mb-3 w-72 rounded-xl border border-slate-200/70 bg-white p-4 shadow-md dark:border-slate-800/70 dark:bg-slate-900"
    >
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Settings
      </p>
      <div className="mt-3 space-y-1.5">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Layout
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
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onExportTasks}
            className="rounded-md border border-slate-200/70 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Export tasks
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="rounded-md border border-slate-200/70 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Import tasks
          </button>
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
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {importFeedback}
          </p>
        ) : null}
      </div>
    </BottomActionButton>
  );
};

export default BoardSettingsWidget;
