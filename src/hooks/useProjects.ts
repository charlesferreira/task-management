import { useEffect, useState } from 'react'
import type { Project } from '../models/types'
import { projectService } from '../services/projectService'

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `project-${Date.now()}`
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    setProjects(projectService.getOrInitializeProjects())
  }, [])

  const saveProjects = (next: Project[]) => {
    setProjects(next)
    projectService.saveProjects(next)
  }

  const createProject = (name: string, color: string) => {
    const maxOrder = projects.reduce(
      (max, project) => Math.max(max, project.order),
      -1,
    )
    const next: Project = {
      id: generateId(),
      name,
      color,
      order: maxOrder + 1,
    }
    const updated = [...projects, next]
    saveProjects(updated)
    return updated
  }

  const reorderProjects = (next: Project[]) => {
    const normalized = projectService.reorderProjects(next)
    setProjects(normalized)
    return normalized
  }

  const updateProject = (
    projectId: string,
    updates: Partial<Pick<Project, 'name' | 'color'>>,
  ) => {
    const updated = projects.map((project) =>
      project.id === projectId ? { ...project, ...updates } : project,
    )
    saveProjects(updated)
    return updated
  }

  return {
    projects,
    setProjects: saveProjects,
    createProject,
    reorderProjects,
    updateProject,
  }
}
