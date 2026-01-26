import { useEffect, useState } from 'react'
import type { Task } from '../models/types'
import { taskService } from '../services/taskService'

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}`
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setTasks(taskService.getOrInitializeTasks())
  }, [])

  const saveTasks = (next: Task[]) => {
    setTasks(next)
    taskService.saveTasks(next)
  }

  const reorderTasks = (next: Task[]) => {
    const normalized = taskService.reorderTasks(next)
    setTasks(normalized)
  }

  const addTaskAtTop = (title: string, projectId: string | null) => {
    const next: Task = {
      id: generateId(),
      title,
      projectId,
      order: 0,
    }
    const updated = taskService.reorderTasks([next, ...tasks])
    setTasks(updated)
  }

  const addTaskAfterProject = (title: string, projectId: string | null) => {
    const next: Task = {
      id: generateId(),
      title,
      projectId,
      order: tasks.length,
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
  }

  const reorderWithinProject = (
    projectId: string | null,
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
    const projectTasks = projectIndices.map((index) => tasks[index])
    const oldIndex = projectTasks.findIndex((task) => task.id === activeId)
    const newIndex = projectTasks.findIndex((task) => task.id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...projectTasks]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    const updated = [...tasks]
    projectIndices.forEach((index, slot) => {
      updated[index] = reordered[slot]
    })
    const normalized = taskService.reorderTasks(updated)
    setTasks(normalized)
  }

  return {
    tasks,
    setTasks: saveTasks,
    reorderTasks,
    addTaskAtTop,
    addTaskAfterProject,
    reorderWithinProject,
  }
}
