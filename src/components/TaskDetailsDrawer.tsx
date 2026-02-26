import { useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Pause, Play, X } from 'lucide-react'
import type { Project, Task } from '../models/types'
import { UNASSIGNED_PROJECT_ID } from '../models/types'
import CustomDropdown, { type DropdownOption } from './shared/CustomDropdown'
import { getStoryPointsTextTone } from '../utils/storyPoints'
import ProjectBadge from './ProjectBadge'
import TimeCodeInput from './shared/TimeCodeInput'

type TaskDetailsDrawerProps = {
  isOpen: boolean
  task: Task | null
  autoSelectTitle?: boolean
  projects: Project[]
  unassignedProject: Project
  onClose: () => void
  onDelete: (taskId: string) => void
  onComplete: (taskId: string) => void
  onPauseTracking: (taskId: string) => void
  onToggleTracking: (taskId: string) => void
  isTaskTracking: (taskId: string) => boolean
  getTaskLiveMinutes: (taskId: string) => number
  onSave: (
    taskId: string,
    updates: {
      title: string
      projectId: string | null
      description: string
      storyPoints: 1 | 2 | 3 | 5 | 8 | null
      actualTimeMinutes: number
    },
  ) => void
}

type DrawerContentProps = {
  task: Task | null
  autoSelectTitle?: boolean
  projects: Project[]
  unassignedProject: Project
  onClose: () => void
  onDelete: (taskId: string) => void
  onComplete: (taskId: string) => void
  onPauseTracking: (taskId: string) => void
  onToggleTracking: (taskId: string) => void
  isTaskTracking: (taskId: string) => boolean
  getTaskLiveMinutes: (taskId: string) => number
  onSave: (
    taskId: string,
    updates: {
      title: string
      projectId: string | null
      description: string
      storyPoints: 1 | 2 | 3 | 5 | 8 | null
      actualTimeMinutes: number
    },
  ) => void
}

const spOptions: DropdownOption<'-' | '1' | '2' | '3' | '5' | '8'>[] = [
  { value: '-', label: '-', toneClassName: getStoryPointsTextTone(null) },
  { value: '1', label: '1', toneClassName: getStoryPointsTextTone(1) },
  { value: '2', label: '2', toneClassName: getStoryPointsTextTone(2) },
  { value: '3', label: '3', toneClassName: getStoryPointsTextTone(3) },
  { value: '5', label: '5', toneClassName: getStoryPointsTextTone(5) },
  { value: '8', label: '8', toneClassName: getStoryPointsTextTone(8) },
]

const storyPointsToValue = (storyPoints: 1 | 2 | 3 | 5 | 8 | null) => {
  if (storyPoints === null) return '-'
  return String(storyPoints) as '1' | '2' | '3' | '5' | '8'
}

const valueToStoryPoints = (value: '-' | '1' | '2' | '3' | '5' | '8') => {
  if (value === '-') return null
  return Number.parseInt(value, 10) as 1 | 2 | 3 | 5 | 8
}

const TaskDetailsDrawerContent = ({
  task,
  autoSelectTitle = false,
  projects,
  unassignedProject,
  onClose,
  onDelete,
  onComplete,
  onPauseTracking,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
  onSave,
}: DrawerContentProps) => {
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false)
  const projectPickerRef = useRef<HTMLDivElement | null>(null)
  const projectOptionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const [titleDraft, setTitleDraft] = useState(task?.title ?? '')
  const [, setRenderSecond] = useState(0)
  const animationFrameRef = useRef<number | null>(null)
  const lastSecondRef = useRef<number>(0)
  const trackingThisTask = task ? isTaskTracking(task.id) : false
  const liveMinutes =
    task && trackingThisTask ? getTaskLiveMinutes(task.id) : (task?.actualTimeMinutes ?? 0)
  const timeSeconds = Math.max(0, Math.floor(liveMinutes * 60))

  const orderedProjects = useMemo(
    () => [...projects].sort((a, b) => a.order - b.order),
    [projects],
  )

  const selectableProjects = useMemo<Project[]>(
    () => [unassignedProject, ...orderedProjects],
    [orderedProjects, unassignedProject],
  )

  const selectedProject =
    selectableProjects.find((project) =>
      project.id === UNASSIGNED_PROJECT_ID
        ? (task?.projectId ?? UNASSIGNED_PROJECT_ID) === UNASSIGNED_PROJECT_ID
        : project.id === (task?.projectId ?? UNASSIGNED_PROJECT_ID),
    ) ?? unassignedProject

  const selectedProjectIndex = selectableProjects.findIndex((project) =>
    project.id === UNASSIGNED_PROJECT_ID
      ? (task?.projectId ?? UNASSIGNED_PROJECT_ID) === UNASSIGNED_PROJECT_ID
      : project.id === (task?.projectId ?? UNASSIGNED_PROJECT_ID),
  )

  useEffect(() => {
    setTitleDraft(task?.title ?? '')
  }, [task?.id])

  useEffect(() => {
    if (!autoSelectTitle || !task) return
    const frame = window.requestAnimationFrame(() => {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [autoSelectTitle, task?.id])

  useEffect(() => {
    if (!isProjectPickerOpen) return
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (projectPickerRef.current?.contains(target)) return
      setIsProjectPickerOpen(false)
    }
    window.addEventListener('mousedown', handleOutside)
    return () => window.removeEventListener('mousedown', handleOutside)
  }, [isProjectPickerOpen])

  useEffect(() => {
    if (!isProjectPickerOpen) return
    const focusIndex = selectedProjectIndex >= 0 ? selectedProjectIndex : 0
    const timer = window.setTimeout(() => {
      projectOptionRefs.current[focusIndex]?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [isProjectPickerOpen, selectedProjectIndex])

  useEffect(() => {
    if (!trackingThisTask) {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = null
      return
    }

    lastSecondRef.current = Math.floor(Date.now() / 1000)
    const loop = () => {
      const second = Math.floor(Date.now() / 1000)
      if (second !== lastSecondRef.current) {
        lastSecondRef.current = second
        setRenderSecond(second)
      }
      animationFrameRef.current = window.requestAnimationFrame(loop)
    }
    animationFrameRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = null
    }
  }, [trackingThisTask])

  const saveTaskPatch = (patch: {
    title?: string
    projectId?: string | null
    description?: string
    storyPoints?: 1 | 2 | 3 | 5 | 8 | null
    actualTimeMinutes?: number
  }) => {
    if (!task) return
    onSave(task.id, {
      title: patch.title ?? task.title,
      projectId: patch.projectId !== undefined ? patch.projectId : task.projectId,
      description: patch.description ?? task.description,
      storyPoints:
        patch.storyPoints !== undefined ? patch.storyPoints : task.storyPoints,
      actualTimeMinutes: patch.actualTimeMinutes ?? task.actualTimeMinutes,
    })
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Task details
          </h2>
          <div className="relative max-w-max" ref={projectPickerRef}>
            <button
              type="button"
              onClick={() => {
                if (!task) return
                setIsProjectPickerOpen((open) => !open)
              }}
              disabled={!task}
              aria-haspopup="listbox"
              aria-expanded={isProjectPickerOpen}
              className="rounded-lg border border-transparent p-0.5 disabled:opacity-50"
            >
              <ProjectBadge project={selectedProject} />
            </button>
            {isProjectPickerOpen && task ? (
              <div
                role="listbox"
                aria-label="Project options"
                className="absolute top-full left-0 z-50 mt-2 min-w-60 rounded-xl border border-slate-200/70 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-1">
                  {selectableProjects.map((project, index) => {
                    const optionValue =
                      project.id === UNASSIGNED_PROJECT_ID
                        ? UNASSIGNED_PROJECT_ID
                        : project.id
                    const isSelected =
                      (task.projectId ?? UNASSIGNED_PROJECT_ID) === optionValue
                    return (
                      <button
                        key={project.id}
                        ref={(element) => {
                          projectOptionRefs.current[index] = element
                        }}
                        type="button"
                        onClick={() => {
                          saveTaskPatch({
                            projectId:
                              optionValue === UNASSIGNED_PROJECT_ID
                                ? null
                                : optionValue,
                          })
                          setIsProjectPickerOpen(false)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'ArrowDown') {
                            event.preventDefault()
                            const nextIndex = (index + 1) % selectableProjects.length
                            projectOptionRefs.current[nextIndex]?.focus()
                            return
                          }
                          if (event.key === 'ArrowUp') {
                            event.preventDefault()
                            const previousIndex =
                              (index - 1 + selectableProjects.length) %
                              selectableProjects.length
                            projectOptionRefs.current[previousIndex]?.focus()
                            return
                          }
                          if (event.key === 'Home') {
                            event.preventDefault()
                            projectOptionRefs.current[0]?.focus()
                            return
                          }
                          if (event.key === 'End') {
                            event.preventDefault()
                            projectOptionRefs.current[
                              selectableProjects.length - 1
                            ]?.focus()
                            return
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault()
                            setIsProjectPickerOpen(false)
                          }
                        }}
                        role="option"
                        aria-selected={isSelected}
                        className={`flex items-center justify-between rounded-lg px-2 py-1.5 transition ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <ProjectBadge project={project} />
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/70 text-slate-500 dark:border-slate-700 dark:text-slate-300"
        >
          <X className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {!task ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a task to edit details.
          </p>
        ) : null}

        <div className="flex items-end gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Title
            </span>
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(event) => {
                const nextTitle = event.target.value
                setTitleDraft(nextTitle)
                if (nextTitle.trim()) {
                  saveTaskPatch({ title: nextTitle })
                }
              }}
              disabled={!task}
              className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
            />
          </label>

          <div className="flex max-w-max flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              SP
            </span>
            <CustomDropdown
              label="Story points"
              value={storyPointsToValue(task?.storyPoints ?? null)}
              options={spOptions}
              onChange={(value) =>
                saveTaskPatch({ storyPoints: valueToStoryPoints(value) })
              }
              disabled={!task}
              compact
              className="w-16"
            />
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Description
          </span>
          <textarea
            value={task?.description ?? ''}
            onChange={(event) => saveTaskPatch({ description: event.target.value })}
            disabled={!task}
            rows={8}
            className="w-full resize-y rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
          />
        </label>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Time tracked
          </p>
          <div className="flex items-stretch gap-2">
            <TimeCodeInput
              valueSeconds={timeSeconds}
              onChange={(nextSeconds) => {
                if (!task) return
                if (nextSeconds === timeSeconds) return
                if (task && isTaskTracking(task.id)) {
                  onPauseTracking(task.id)
                }
                saveTaskPatch({ actualTimeMinutes: nextSeconds / 60 })
              }}
              disabled={!task}
            />
            <button
              type="button"
              onClick={() => {
                if (!task) return
                onToggleTracking(task.id)
              }}
              disabled={!task}
              className="inline-flex h-11 min-w-13 items-center justify-center rounded-lg border border-slate-200/70 bg-white px-3 text-slate-600 transition hover:text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              aria-label={trackingThisTask ? 'Pause timer' : 'Start timer'}
            >
              {trackingThisTask ? (
                <Pause className="h-4 w-4" strokeWidth={2.6} />
              ) : (
                <Play className="h-4 w-4" strokeWidth={2.6} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center border-t border-slate-200/70 px-5 py-4 dark:border-slate-800/70">
        <button
          type="button"
          onClick={() => {
            if (!task) return
            onDelete(task.id)
            onClose()
          }}
          disabled={!task}
          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-40 dark:border-rose-500/40 dark:text-rose-400"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => {
            if (!task) return
            if (!task.completedAt) onComplete(task.id)
            onClose()
          }}
          disabled={!task}
          className="ml-auto rounded-lg border border-slate-200/70 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          Mark as Complete
        </button>
      </div>
    </>
  )
}

const TaskDetailsDrawer = ({
  isOpen,
  task,
  autoSelectTitle = false,
  projects,
  unassignedProject,
  onClose,
  onDelete,
  onComplete,
  onPauseTracking,
  onToggleTracking,
  isTaskTracking,
  getTaskLiveMinutes,
  onSave,
}: TaskDetailsDrawerProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          className="drawer-overlay fixed inset-0 z-40 bg-slate-950/35"
        />
        <Dialog.Content
          forceMount
          className="drawer-content fixed top-0 right-0 z-50 h-screen w-full max-w-xl border-l border-slate-200/70 bg-white shadow-2xl dark:border-slate-800/70 dark:bg-slate-900"
          aria-label="Task details"
        >
          <div className="flex h-full flex-col">
            <TaskDetailsDrawerContent
              key={task?.id ?? 'no-task-selected'}
              task={task}
              autoSelectTitle={autoSelectTitle}
              projects={projects}
              unassignedProject={unassignedProject}
              onClose={onClose}
              onDelete={onDelete}
              onComplete={onComplete}
              onPauseTracking={onPauseTracking}
              onToggleTracking={onToggleTracking}
              isTaskTracking={isTaskTracking}
              getTaskLiveMinutes={getTaskLiveMinutes}
              onSave={onSave}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default TaskDetailsDrawer
