import type { ReactNode } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type SortableTaskListProps = {
  taskIds: string[];
  children: ReactNode;
};

const SortableTaskList = ({ taskIds, children }: SortableTaskListProps) => {
  return (
    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
      {children}
    </SortableContext>
  );
};

export default SortableTaskList;
