import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

type DetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
};

const DetailsDrawer = ({
  isOpen,
  onClose,
  ariaLabel,
  children,
}: DetailsDrawerProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          className="drawer-overlay fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px]"
        />
        <Dialog.Content
          forceMount
          className="drawer-content fixed top-0 right-0 z-50 h-screen w-full max-w-xl border-l border-slate-200/70 bg-white shadow-2xl outline-none dark:border-slate-800/70 dark:bg-slate-900"
          aria-label={ariaLabel}
        >
          <div className="flex h-full flex-col">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DetailsDrawer;
