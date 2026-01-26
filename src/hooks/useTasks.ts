import { useEffect, useState } from 'react'
import type { Task } from '../models/types'
import { taskService } from '../services/taskService'

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

  return { tasks, setTasks: saveTasks, reorderTasks }
}
