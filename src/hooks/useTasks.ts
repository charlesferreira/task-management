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

  const toggleComplete = (taskId: string) => {
    const updated = tasks.map((task) => {
      if (task.id !== taskId) return task
      return {
        ...task,
        completedAt: task.completedAt ? null : new Date().toISOString(),
      }
    })
    setTasks(taskService.reorderTasks(updated))
  }

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((task) => task.id !== taskId)
    setTasks(taskService.reorderTasks(updated))
  }

  const deleteCompleted = () => {
    const updated = tasks.filter((task) => !task.completedAt)
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
      completedAt: null,
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

  return {
    tasks,
    setTasks: saveTasks,
    reorderTasks,
    reorderVisibleTasks,
    moveTaskInBoard,
    addTaskAtTop,
    addTaskAfterProject,
    reorderWithinProject,
    toggleComplete,
    deleteTask,
    deleteCompleted,
  }
}
