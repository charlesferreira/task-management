import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const useSortableTask = (taskId: string) => {
  const sortable = useSortable({ id: taskId });
  const transform = sortable.isDragging ? null : sortable.transform;

  return {
    ...sortable,
    style: {
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      transition: sortable.transition,
    },
  };
};
