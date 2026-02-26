import { useMemo, useState } from 'react'
import type { Task, TaskHistoryEvent, TaskHistoryEventType } from '../models/types'
import { taskHistoryService } from '../services/taskHistoryService'
import { taskService } from '../services/taskService'

const TRACKER_STORAGE_KEY = 'taskOrganizer.timeTracker'

type TimeTrackerState = {
  runningByTaskId: Record<string, string>
}

const readTrackerState = (): TimeTrackerState => {
  const raw = localStorage.getItem(TRACKER_STORAGE_KEY)
  if (!raw) return { runningByTaskId: {} }
  try {
    const data = JSON.parse(raw) as
      | TimeTrackerState
      | {
          taskId?: string | null
          startedAt?: string | null
        }

    if (
      'runningByTaskId' in data &&
      data.runningByTaskId &&
      typeof data.runningByTaskId === 'object'
    ) {
      const cleaned: Record<string, string> = {}
      Object.entries(data.runningByTaskId).forEach(([taskId, startedAt]) => {
        if (
          typeof taskId === 'string' &&
          taskId &&
          typeof startedAt === 'string' &&
          !Number.isNaN(new Date(startedAt).getTime())
        ) {
          cleaned[taskId] = startedAt
        }
      })
      return { runningByTaskId: cleaned }
    }

    if (
      'taskId' in data &&
      typeof data.taskId === 'string' &&
      data.taskId &&
      'startedAt' in data &&
      typeof data.startedAt === 'string' &&
      !Number.isNaN(new Date(data.startedAt).getTime())
    ) {
      return { runningByTaskId: { [data.taskId]: data.startedAt } }
    }

    return { runningByTaskId: {} }
  } catch {
    return { runningByTaskId: {} }
  }
}

const roundMinutes = (minutes: number) => Math.round(minutes * 100) / 100

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}`
}

const toDayKey = (isoDate: string) => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export type DailyCompletionStat = {
  day: string
  tasksCompleted: number
  pointsCompleted: number
  effortMinutes: number
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() =>
    taskService.getOrInitializeTasks(),
  )
  const [history, setHistory] = useState<TaskHistoryEvent[]>(() =>
    taskHistoryService.getEvents(),
  )
  const [tracker, setTracker] = useState<TimeTrackerState>(() =>
    readTrackerState(),
  )

  const saveTasks = (next: Task[]) => {
    setTasks(next)
    taskService.saveTasks(next)
  }

  const saveTracker = (next: TimeTrackerState) => {
    setTracker(next)
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(next))
  }

  const addHistoryEvent = (
    task: Task,
    eventType: TaskHistoryEventType,
    fromCompletedAt: string | null,
    toCompletedAt: string | null,
  ) => {
    const event: TaskHistoryEvent = {
      id: generateId(),
      taskId: task.id,
      eventType,
      fromCompletedAt,
      toCompletedAt,
      pointsSnapshot: task.storyPoints,
      effortSnapshotMinutes: task.actualTimeMinutes,
      occurredAt: new Date().toISOString(),
    }
    setHistory((previousHistory) => {
      const next = [...previousHistory, event]
      taskHistoryService.saveEvents(next)
      return next
    })
  }

  const reorderTasks = (next: Task[]) => {
    const normalized = taskService.reorderTasks(next)
    setTasks(normalized)
  }

  const pauseTracking = (taskId: string, sourceTasks: Task[] = tasks) => {
    const startedAt = tracker.runningByTaskId[taskId]
    if (!startedAt) {
      return sourceTasks
    }
    const startedAtMs = new Date(startedAt).getTime()
    if (Number.isNaN(startedAtMs)) {
      const nextRunning = { ...tracker.runningByTaskId }
      delete nextRunning[taskId]
      saveTracker({ runningByTaskId: nextRunning })
      return sourceTasks
    }
    const elapsedMinutes = Math.max(0, (Date.now() - startedAtMs) / 60000)
    const nextRunning = { ...tracker.runningByTaskId }
    delete nextRunning[taskId]
    if (elapsedMinutes > 0) {
      const updated = sourceTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              actualTimeMinutes: roundMinutes(task.actualTimeMinutes + elapsedMinutes),
            }
          : task,
      )
      const normalized = taskService.reorderTasks(updated)
      setTasks(normalized)
      saveTracker({ runningByTaskId: nextRunning })
      return normalized
    }
    saveTracker({ runningByTaskId: nextRunning })
    return sourceTasks
  }

  const startTracking = (taskId: string) => {
    if (tracker.runningByTaskId[taskId]) return
    saveTracker({
      runningByTaskId: {
        ...tracker.runningByTaskId,
        [taskId]: new Date().toISOString(),
      },
    })
  }

  const toggleTracking = (taskId: string) => {
    if (tracker.runningByTaskId[taskId]) {
      pauseTracking(taskId)
      return
    }
    startTracking(taskId)
  }

  const isTaskTracking = (taskId: string) =>
    Boolean(tracker.runningByTaskId[taskId])

  const getTaskLiveMinutes = (taskId: string) => {
    const task = tasks.find((entry) => entry.id === taskId)
    if (!task) return 0
    const startedAt = tracker.runningByTaskId[taskId]
    if (!startedAt) return task.actualTimeMinutes
    const startedAtMs = new Date(startedAt).getTime()
    if (Number.isNaN(startedAtMs)) return task.actualTimeMinutes
    return task.actualTimeMinutes + (Date.now() - startedAtMs) / 60000
  }

  const toggleComplete = (taskId: string) => {
    const sourceTasks = isTaskTracking(taskId) ? pauseTracking(taskId, tasks) : tasks
    const target = sourceTasks.find((task) => task.id === taskId)
    if (!target) return

    const nextCompletedAt = target.completedAt ? null : new Date().toISOString()
    const updated = sourceTasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completedAt: nextCompletedAt,
          }
        : task,
    )

    const normalized = taskService.reorderTasks(updated)
    setTasks(normalized)

    const updatedTask = normalized.find((task) => task.id === taskId)
    if (!updatedTask) return
    addHistoryEvent(
      updatedTask,
      nextCompletedAt ? 'task_completed' : 'task_reopened',
      target.completedAt,
      nextCompletedAt,
    )
  }

  const deleteTask = (taskId: string) => {
    const sourceTasks = isTaskTracking(taskId) ? pauseTracking(taskId, tasks) : tasks
    const updated = sourceTasks.filter((task) => task.id !== taskId)
    if (tracker.runningByTaskId[taskId]) {
      const nextRunning = { ...tracker.runningByTaskId }
      delete nextRunning[taskId]
      saveTracker({ runningByTaskId: nextRunning })
    }
    setTasks(taskService.reorderTasks(updated))
  }

  const updateTaskTitle = (taskId: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return

    const previous = tasks.find((task) => task.id === taskId)
    if (!previous || previous.title === trimmed) return

    const updated = tasks.map((task) =>
      task.id === taskId ? { ...task, title: trimmed } : task,
    )
    const normalized = taskService.reorderTasks(updated)
    setTasks(normalized)

    const updatedTask = normalized.find((task) => task.id === taskId)
    if (updatedTask) {
      addHistoryEvent(
        updatedTask,
        'task_updated',
        previous.completedAt,
        updatedTask.completedAt,
      )
    }
  }

  const updateTaskDetails = (
    taskId: string,
    updates: {
      title: string
      projectId: string | null
      description: string
      storyPoints: 1 | 2 | 3 | 5 | 8 | null
      actualTimeMinutes: number
    },
  ) => {
    const previous = tasks.find((task) => task.id === taskId)
    if (!previous) return

    const trimmedTitle = updates.title.trim()
    if (!trimmedTitle) return

    const actualTimeMinutes = Number.isFinite(updates.actualTimeMinutes)
      ? roundMinutes(Math.max(0, updates.actualTimeMinutes))
      : 0

    const nextTask: Task = {
      ...previous,
      title: trimmedTitle,
      projectId: updates.projectId,
      description: updates.description,
      storyPoints: updates.storyPoints,
      actualTimeMinutes,
    }

    const hasChanged =
      previous.title !== nextTask.title ||
      previous.projectId !== nextTask.projectId ||
      previous.description !== nextTask.description ||
      previous.storyPoints !== nextTask.storyPoints ||
      previous.actualTimeMinutes !== nextTask.actualTimeMinutes

    if (!hasChanged) return

    const updated = tasks.map((task) => (task.id === taskId ? nextTask : task))
    const normalized = taskService.reorderTasks(updated)
    setTasks(normalized)

    const updatedTask = normalized.find((task) => task.id === taskId)
    if (updatedTask) {
      addHistoryEvent(
        updatedTask,
        'task_updated',
        previous.completedAt,
        updatedTask.completedAt,
      )
    }
  }

  const deleteCompleted = () => {
    const updated = tasks.filter((task) => !task.completedAt)
    const validTaskIds = new Set(updated.map((task) => task.id))
    const nextRunning = Object.fromEntries(
      Object.entries(tracker.runningByTaskId).filter(([taskId]) =>
        validTaskIds.has(taskId),
      ),
    )
    if (Object.keys(nextRunning).length !== Object.keys(tracker.runningByTaskId).length) {
      saveTracker({ runningByTaskId: nextRunning })
    }
    setTasks(taskService.reorderTasks(updated))
  }

  const reorderVisibleTasks = (
    activeId: string,
    overId: string,
    visibleTaskIds: string[],
  ) => {
    if (activeId === overId) return
    const visibleIndices = tasks
      .map((task, index) => ({
        index,
        matches: visibleTaskIds.includes(task.id),
      }))
      .filter((entry) => entry.matches)
      .map((entry) => entry.index)
    const visibleTasks = visibleIndices.map((index) => tasks[index])
    const oldIndex = visibleTasks.findIndex((task) => task.id === activeId)
    const newIndex = visibleTasks.findIndex((task) => task.id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...visibleTasks]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    const updated = [...tasks]
    visibleIndices.forEach((index, slot) => {
      updated[index] = reordered[slot]
    })
    setTasks(taskService.reorderTasks(updated))
  }

  const moveTaskInBoard = (
    activeId: string,
    overId: string | null,
    targetProjectId: string | null,
    visibleTaskIds: string[],
  ) => {
    const visibleSet = new Set(visibleTaskIds)
    const updatedTasks = tasks.map((task) =>
      task.id === activeId ? { ...task, projectId: targetProjectId } : task,
    )
    const visibleIndices = updatedTasks
      .map((task, index) => ({
        index,
        matches: visibleSet.has(task.id),
      }))
      .filter((entry) => entry.matches)
      .map((entry) => entry.index)
    const visibleTasks = visibleIndices.map((index) => updatedTasks[index])
    const fromIndex = visibleTasks.findIndex((task) => task.id === activeId)
    if (fromIndex === -1) return

    let toIndex = 0
    if (overId) {
      toIndex = visibleTasks.findIndex((task) => task.id === overId)
      if (toIndex === -1) return
    } else {
      const lastIndex = [...visibleTasks]
        .reverse()
        .findIndex((task) => task.projectId === targetProjectId)
      if (lastIndex === -1) {
        toIndex = visibleTasks.length
      } else {
        toIndex = visibleTasks.length - lastIndex
      }
    }

    const reordered = [...visibleTasks]
    const [moved] = reordered.splice(fromIndex, 1)
    const insertIndex = toIndex > fromIndex ? toIndex - 1 : toIndex
    reordered.splice(insertIndex, 0, moved)

    const updated = [...updatedTasks]
    visibleIndices.forEach((index, slot) => {
      updated[index] = reordered[slot]
    })
    setTasks(taskService.reorderTasks(updated))
  }

  const addTaskAtTop = (title: string, projectId: string | null) => {
    const next: Task = {
      id: generateId(),
      title,
      projectId,
      order: 0,
      completedAt: null,
      description: '',
      storyPoints: null,
      actualTimeMinutes: 0,
    }
    const updated = taskService.reorderTasks([next, ...tasks])
    setTasks(updated)
    addHistoryEvent(next, 'task_created', null, null)
    return next.id
  }

  const addTaskAfterProject = (title: string, projectId: string | null) => {
    const next: Task = {
      id: generateId(),
      title,
      projectId,
      order: tasks.length,
      completedAt: null,
      description: '',
      storyPoints: null,
      actualTimeMinutes: 0,
    }
    const indices = tasks
      .map((task, index) => ({
        index,
        matches: task.projectId === projectId,
      }))
      .filter((entry) => entry.matches)
      .map((entry) => entry.index)
    const insertIndex = indices.length > 0 ? indices[indices.length - 1] + 1 : tasks.length
    const updated = [...tasks]
    updated.splice(insertIndex, 0, next)
    const normalized = taskService.reorderTasks(updated)
    setTasks(normalized)
    addHistoryEvent(next, 'task_created', null, null)
    return next.id
  }

  const reorderWithinProject = (
    projectId: string | null,
    visibleTaskIds: string[],
    activeId: string,
    overId: string,
  ) => {
    if (activeId === overId) return
    const projectIndices = tasks
      .map((task, index) => ({
        index,
        matches: task.projectId === projectId,
      }))
      .filter((entry) => entry.matches)
      .map((entry) => entry.index)
    const visibleIndices = projectIndices.filter((index) =>
      visibleTaskIds.includes(tasks[index]?.id ?? ''),
    )
    const projectTasks = visibleIndices.map((index) => tasks[index])
    const oldIndex = projectTasks.findIndex((task) => task.id === activeId)
    const newIndex = projectTasks.findIndex((task) => task.id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...projectTasks]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    const updated = [...tasks]
    visibleIndices.forEach((index, slot) => {
      updated[index] = reordered[slot]
    })
    const normalized = taskService.reorderTasks(updated)
    setTasks(normalized)
  }

  const dailyCompletionStats = useMemo<DailyCompletionStat[]>(() => {
    const byDay = new Map<string, DailyCompletionStat>()

    history.forEach((event) => {
      if (event.eventType !== 'task_completed') return
      const dayKey = toDayKey(event.occurredAt)
      if (!dayKey) return

      const current = byDay.get(dayKey) ?? {
        day: dayKey,
        tasksCompleted: 0,
        pointsCompleted: 0,
        effortMinutes: 0,
      }

      current.tasksCompleted += 1
      current.pointsCompleted += event.pointsSnapshot ?? 0
      current.effortMinutes += event.effortSnapshotMinutes

      byDay.set(dayKey, current)
    })

    return [...byDay.values()].sort((a, b) => b.day.localeCompare(a.day))
  }, [history])

  const today = toDayKey(new Date().toISOString())
  const todayStats =
    dailyCompletionStats.find((stat) => stat.day === today) ?? {
      day: today ?? '',
      tasksCompleted: 0,
      pointsCompleted: 0,
      effortMinutes: 0,
    }

  return {
    tasks,
    history,
    dailyCompletionStats,
    todayStats,
    setTasks: saveTasks,
    reorderTasks,
    reorderVisibleTasks,
    moveTaskInBoard,
    startTracking,
    pauseTracking,
    toggleTracking,
    isTaskTracking,
    getTaskLiveMinutes,
    addTaskAtTop,
    addTaskAfterProject,
    reorderWithinProject,
    toggleComplete,
    deleteTask,
    deleteCompleted,
    updateTaskTitle,
    updateTaskDetails,
  }
}
