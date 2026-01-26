import type { Task } from '../models/types'

const STORAGE_KEY = 'taskOrganizer.tasks'

const sampleTasks: Task[] = [
  { id: 'task-1', title: 'Plan weekly goals', projectId: 'project-1', order: 0 },
  { id: 'task-2', title: 'Review pull requests', projectId: 'project-2', order: 1 },
  { id: 'task-3', title: 'Draft new app concept', projectId: 'project-3', order: 2 },
  { id: 'task-4', title: 'Schedule gym sessions', projectId: 'project-1', order: 3 },
  { id: 'task-5', title: 'Prepare project brief', projectId: 'project-2', order: 4 },
]

const readTasks = (): Task[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as Task[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const writeTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

const sortByOrder = (tasks: Task[]) =>
  [...tasks].sort((a, b) => a.order - b.order)

export const taskService = {
  getTasks() {
    return sortByOrder(readTasks())
  },
  saveTasks(tasks: Task[]) {
    writeTasks(tasks)
  },
  getOrInitializeTasks() {
    const existing = readTasks()
    if (existing.length > 0) return sortByOrder(existing)
    writeTasks(sampleTasks)
    return sortByOrder(sampleTasks)
  },
  reorderTasks(tasks: Task[]) {
    const normalized = sortByOrder(tasks).map((task, index) => ({
      ...task,
      order: index,
    }))
    writeTasks(normalized)
    return normalized
  },
  createTask(task: Task) {
    const tasks = sortByOrder(readTasks())
    const next = [...tasks, task]
    writeTasks(next)
    return next
  },
  updateTask(updated: Task) {
    const tasks = readTasks().map((task) =>
      task.id === updated.id ? updated : task,
    )
    writeTasks(tasks)
    return sortByOrder(tasks)
  },
  deleteTask(taskId: string) {
    const tasks = readTasks().filter((task) => task.id !== taskId)
    const normalized = sortByOrder(tasks).map((task, index) => ({
      ...task,
      order: index,
    }))
    writeTasks(normalized)
    return normalized
  },
}
