import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Project, Task } from "../models/types";
import { UNASSIGNED_PROJECT_ID } from "../models/types";
import TaskTable from "./TaskTable";

type ProjectDetailsDrawerProps = {
  isOpen: boolean;
  project: Project | null;
  tasks: Task[];
  onClose: () => void;
  onOpenTaskDetails: (taskId: string) => void;
  onSave: (
    projectId: string,
    updates: { name: string; color: string },
  ) => void;
  onReorderTasks: (activeId: string, overId: string, visibleIds: string[]) => void;
  isTaskTracking: (taskId: string) => boolean;
  getTaskLiveMinutes: (taskId: string) => number;
  onSaveUnassignedName: (name: string) => void;
  onCreateTask: (projectId: string | null, title: string) => void;
  onDelete: (projectId: string) => void;
};

const ProjectDetailsDrawer = ({
  isOpen,
  project,
  tasks,
  onClose,
  onOpenTaskDetails,
  onSave,
  onReorderTasks,
  isTaskTracking,
  getTaskLiveMinutes,
  onSaveUnassignedName,
  onCreateTask,
  onDelete,
}: ProjectDetailsDrawerProps) => {
  const [nameDraft, setNameDraft] = useState(project?.name ?? "");
  const [colorDraft, setColorDraft] = useState(project?.color ?? "#94a3b8");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.order - b.order),
    [tasks],
  );

  const isUnassigned = project?.id === UNASSIGNED_PROJECT_ID;

  const handleAddTask = () => {
    if (!project) return;
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    onCreateTask(isUnassigned ? null : project.id, trimmed);
    setNewTaskTitle("");
  };

  const saveProjectPatch = (patch: { name?: string; color?: string }) => {
    if (!project) return;
    const nextName = patch.name ?? nameDraft;
    const trimmedName = nextName.trim();
    if (!trimmedName) return;

    if (patch.name !== undefined && patch.name !== nameDraft) {
      setNameDraft(patch.name);
    }
    if (patch.color !== undefined && patch.color !== colorDraft) {
      setColorDraft(patch.color);
    }

    if (isUnassigned) {
      onSaveUnassignedName(trimmedName);
      return;
    }

    onSave(project.id, {
      name: trimmedName,
      color: patch.color ?? colorDraft ?? project.color,
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed top-0 right-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-slate-200/70 bg-white shadow-xl outline-none dark:border-slate-800/70 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
            <Dialog.Title className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Project details
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Close project details"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          {project ? (
            <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Name
                  </p>
                  <input
                    value={nameDraft}
                    onChange={(event) => {
                      const nextName = event.target.value;
                      setNameDraft(nextName);
                      if (nextName.trim()) {
                        saveProjectPatch({ name: nextName });
                      }
                    }}
                    onBlur={() => saveProjectPatch({ name: nameDraft })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        saveProjectPatch({ name: nameDraft });
                        event.currentTarget.blur();
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Color
                  </p>
                  <div className="h-10 w-10 rounded-full border border-slate-200/70 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <input
                      type="color"
                      value={colorDraft}
                      onChange={(event) => {
                        const nextColor = event.target.value;
                        setColorDraft(nextColor);
                        saveProjectPatch({ color: nextColor });
                      }}
                      disabled={isUnassigned}
                      className="h-full w-full cursor-pointer appearance-none overflow-hidden rounded-full border-0 p-0 disabled:cursor-not-allowed"
                      aria-label="Project color"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 min-h-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Tasks ({sortedTasks.length})
                  </p>
                </div>
                <div className="mb-3">
                  <input
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddTask();
                      }
                    }}
                    placeholder="Add task and press Enter"
                    className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
                  />
                </div>
                {sortedTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200/70 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    No tasks in this project.
                  </div>
                ) : (
                  <div className="max-h-full overflow-y-auto">
                    <TaskTable
                      tasks={sortedTasks}
                      onReorder={onReorderTasks}
                      onOpenTaskDetails={(taskId) => {
                        onClose();
                        onOpenTaskDetails(taskId);
                      }}
                      isTaskTracking={isTaskTracking}
                      getTaskLiveMinutes={getTaskLiveMinutes}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {project ? (
            <div className="flex items-center border-t border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
              {!isUnassigned ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(project.id);
                    onClose();
                  }}
                  className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 dark:border-rose-500/40 dark:text-rose-400"
                >
                  Delete
                </button>
              ) : null}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ProjectDetailsDrawer;
