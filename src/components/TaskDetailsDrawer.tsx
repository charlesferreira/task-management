import { useEffect, useMemo, useRef, useState } from 'react'
import type { Project, Task } from '../models/types'
import { UNASSIGNED_PROJECT_ID } from '../models/types'
import CustomDropdown, { type DropdownOption } from './shared/CustomDropdown'
import { getStoryPointsTextTone } from '../utils/storyPoints'
import ProjectBadge from './ProjectBadge'
import TimeCodeInput from './shared/TimeCodeInput'

type TaskDetailsDrawerProps = {
  isOpen: boolean
  task: Task | null
  projects: Project[]
  unassignedProject: Project
  onClose: () => void
  onDelete: (taskId: string) => void
  onComplete: (taskId: string) => void
  onPauseTracking: () => void
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
  projects: Project[]
  unassignedProject: Project
  onClose: () => void
  onDelete: (taskId: string) => void
  onComplete: (taskId: string) => void
  onPauseTracking: () => void
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
  projects,
  unassignedProject,
  onClose,
  onDelete,
  onComplete,
  onPauseTracking,
  isTaskTracking,
  getTaskLiveMinutes,
  onSave,
}: DrawerContentProps) => {
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false)
  const projectPickerRef = useRef<HTMLDivElement | null>(null)
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
      projectId: patch.projectId ?? task.projectId,
      description: patch.description ?? task.description,
      storyPoints: patch.storyPoints ?? task.storyPoints,
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
              className="rounded-lg border border-transparent p-0.5 disabled:opacity-50"
            >
              <ProjectBadge project={selectedProject} />
            </button>
            {isProjectPickerOpen && task ? (
              <div className="absolute top-full left-0 z-50 mt-2 min-w-[240px] rounded-xl border border-slate-200/70 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-1">
                  {selectableProjects.map((project) => {
                    const optionValue =
                      project.id === UNASSIGNED_PROJECT_ID
                        ? UNASSIGNED_PROJECT_ID
                        : project.id
                    const isSelected =
                      (task.projectId ?? UNASSIGNED_PROJECT_ID) === optionValue
                    return (
                      <button
                        key={project.id}
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
          className="rounded-lg border border-slate-200/70 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300"
        >
          Close
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
              value={task?.title ?? ''}
              onChange={(event) => saveTaskPatch({ title: event.target.value })}
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
              className="w-[64px]"
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
          <div>
            <TimeCodeInput
              valueSeconds={timeSeconds}
              onChange={(nextSeconds) => {
                if (task && isTaskTracking(task.id)) {
                  onPauseTracking()
                }
                saveTaskPatch({ actualTimeMinutes: nextSeconds / 60 })
              }}
              disabled={!task}
            />
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
  projects,
  unassignedProject,
  onClose,
  onDelete,
  onComplete,
  onPauseTracking,
  isTaskTracking,
  getTaskLiveMinutes,
  onSave,
}: TaskDetailsDrawerProps) => {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/35 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-full max-w-xl border-l border-slate-200/70 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-slate-800/70 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
      >
        <div className="flex h-full flex-col">
          <TaskDetailsDrawerContent
            key={task?.id ?? 'no-task-selected'}
            task={task}
            projects={projects}
            unassignedProject={unassignedProject}
            onClose={onClose}
            onDelete={onDelete}
            onComplete={onComplete}
            onPauseTracking={onPauseTracking}
            isTaskTracking={isTaskTracking}
            getTaskLiveMinutes={getTaskLiveMinutes}
            onSave={onSave}
          />
        </div>
      </aside>
    </>
  )
}

export default TaskDetailsDrawer
