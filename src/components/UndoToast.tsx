type UndoToastProps = {
  message: string
  onUndo: () => void
  onDismiss: () => void
  isClosing: boolean
}

const UndoToast = ({ message, onUndo, onDismiss, isClosing }: UndoToastProps) => {
  return (
    <div
      className={`fixed right-4 bottom-24 z-[70] flex w-[calc(100vw-2rem)] max-w-md items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/95 px-4 py-3 text-slate-100 shadow-xl shadow-slate-950/40 backdrop-blur sm:right-6 sm:w-auto ${
        isClosing ? "undo-toast-exit" : "undo-toast-enter"
      }`}
    >
      <p className="text-sm font-semibold text-slate-100">{message}</p>
      <button
        type="button"
        onClick={onUndo}
        className="rounded-md border border-sky-300/40 bg-sky-400/15 px-2.5 py-1 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/25"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md px-2 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
        aria-label="Dismiss undo notification"
      >
        Dismiss
      </button>
    </div>
  )
}

export default UndoToast
