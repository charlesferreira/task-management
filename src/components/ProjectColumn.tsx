import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { Project, Task } from "../models/types";
import TaskItem from "./TaskItem";

type ProjectColumnProps = {
  project: Project;
  tasks: Task[];
  isUnassigned?: boolean;
  dragHandle?: ReactNode;
  onAddTask: (title: string, projectId: string | null) => void;
  onDeleteProject?: (projectId: string) => void;
  onUpdateProject?: (projectId: string, updates: { name: string; color: string }) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
};

type SortableTaskCardProps = {
  task: Task;
  project: Project;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
};

const SortableTaskCard = ({
  task,
  project,
  onToggleComplete,
  onDeleteTask,
}: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", projectId: task.projectId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-0" : ""}>
      <TaskItem
        task={task}
        project={project}
        isDragging={isDragging}
        showProjectBadge={false}
        onToggleComplete={onToggleComplete}
        onDelete={onDeleteTask}
        dragHandleProps={{
          attributes,
          listeners,
          setActivatorNodeRef,
        }}
      />
    </div>
  );
};

const ProjectColumn = ({
  project,
  tasks,
  isUnassigned = false,
  dragHandle,
  onAddTask,
  onDeleteProject,
  onUpdateProject,
  onToggleComplete,
  onDeleteTask,
}: ProjectColumnProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(project.name);
  const [draftColor, setDraftColor] = useState(project.color);

  useEffect(() => {
    setDraftName(project.name);
    setDraftColor(project.color);
  }, [project.color, project.name]);

  const droppableId = isUnassigned ? "drop:unassigned" : `drop:${project.id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: "column-drop", projectId: isUnassigned ? null : project.id },
  });

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask(trimmed, isUnassigned ? null : project.id);
    setTitle("");
    setIsAdding(false);
  };

  const handleSaveProject = () => {
    const trimmed = draftName.trim();
    if (!trimmed || !onUpdateProject) {
      setIsEditing(false);
      return;
    }
    onUpdateProject(project.id, { name: trimmed, color: draftColor || project.color });
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`group flex min-h-[220px] flex-col gap-3 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm ${
        isOver ? "border-slate-300" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {dragHandle ? (
            <div className="flex w-0 items-center justify-center overflow-hidden opacity-0 transition-[width,opacity] group-hover:w-7 group-hover:opacity-100 group-focus-within:w-7 group-focus-within:opacity-100">
              {dragHandle}
            </div>
          ) : null}
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          {isEditing && !isUnassigned ? (
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSaveProject();
                if (event.key === "Escape") setIsEditing(false);
              }}
              className="w-full min-w-0 rounded-lg border border-slate-200/70 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          ) : (
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {project.name}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {tasks.length}
          </span>
          {!isUnassigned && onUpdateProject ? (
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <div className="h-7 w-7 rounded-full border border-slate-200/70 bg-white p-1 shadow-sm">
                    <input
                      type="color"
                      value={draftColor}
                      onChange={(event) => setDraftColor(event.target.value)}
                      className="h-full w-full cursor-pointer appearance-none overflow-hidden rounded-full border-0 p-0"
                      aria-label="Project color"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProject}
                    className="rounded-lg border border-slate-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftName(project.name);
                      setDraftColor(project.color);
                      setIsEditing(false);
                    }}
                    className="rounded-lg border border-slate-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg border border-slate-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition hover:text-slate-700"
                >
                  Edit
                </button>
              )}
            </div>
          ) : null}
          {!isUnassigned && onDeleteProject ? (
            <button
              type="button"
              onClick={() => onDeleteProject(project.id)}
              className="rounded-lg border border-slate-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition hover:text-rose-500"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200/70 bg-white px-3 py-5 text-center text-xs text-slate-500">
            No tasks to show
          </p>
        ) : (
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2.5">
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  project={project}
                  onToggleComplete={onToggleComplete}
                  onDeleteTask={onDeleteTask}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
      <div className="mt-auto">
        {isAdding ? (
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
                if (event.key === "Escape") {
                  setIsAdding(false);
                  setTitle("");
                }
              }}
              placeholder="Task title"
              className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="min-w-max rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Add task
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setTitle("");
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="min-w-max rounded-lg border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
          >
            Add task
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectColumn;
