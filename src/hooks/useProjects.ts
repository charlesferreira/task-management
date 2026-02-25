import { useState } from 'react'
import { UNASSIGNED_PROJECT_ID, type Project } from '../models/types'
import { projectService } from '../services/projectService'

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `project-${Date.now()}`
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(() =>
    projectService.getOrInitializeProjects(),
  )
  const [unassignedProjectName, setUnassignedProjectName] = useState(() =>
    projectService.getUnassignedProjectName(),
  )

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

  const updateUnassignedProjectName = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setUnassignedProjectName(trimmed)
    projectService.saveUnassignedProjectName(trimmed)
  }

  const unassignedProject: Project = {
    id: UNASSIGNED_PROJECT_ID,
    name: unassignedProjectName,
    color: '#94a3b8',
    order: Number.MAX_SAFE_INTEGER,
  }

  return {
    projects,
    unassignedProject,
    setProjects: saveProjects,
    createProject,
    reorderProjects,
    updateProject,
    updateUnassignedProjectName,
  }
}
