import type { Project } from '../models/types'

const STORAGE_KEY = 'taskOrganizer.projects'

const sampleProjects: Project[] = [
  { id: 'project-1', name: 'Personal', color: '#16a34a' },
  { id: 'project-2', name: 'Work', color: '#2563eb' },
  { id: 'project-3', name: 'Ideas', color: '#f59e0b' },
]

const readProjects = (): Project[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as Project[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const writeProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export const projectService = {
  getProjects() {
    return readProjects()
  },
  saveProjects(projects: Project[]) {
    writeProjects(projects)
  },
  getOrInitializeProjects() {
    const existing = readProjects()
    if (existing.length > 0) return existing
    writeProjects(sampleProjects)
    return sampleProjects
  },
}
