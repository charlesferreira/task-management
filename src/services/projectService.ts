import type { Project } from '../models/types'

const STORAGE_KEY = 'taskOrganizer.projects'
const UNASSIGNED_NAME_KEY = 'taskOrganizer.unassignedProjectName'
const DEFAULT_UNASSIGNED_NAME = 'Unassigned'

const sampleProjects: Project[] = [
  { id: 'project-1', name: 'Personal', color: '#16a34a', order: 0 },
  { id: 'project-2', name: 'Work', color: '#2563eb', order: 1 },
  { id: 'project-3', name: 'Ideas', color: '#f59e0b', order: 2 },
]

const normalizeProjects = (projects: Project[]) => {
  let changed = false
  const normalized = projects.map((project, index) => {
    const order = typeof project.order === 'number' ? project.order : index
    if (order !== project.order) changed = true
    return { ...project, order }
  })
  return { normalized, changed }
}

const sortByOrder = (projects: Project[]) =>
  [...projects].sort((a, b) => a.order - b.order)

const readProjects = (): Project[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as Project[]
    if (!Array.isArray(data)) return []
    const { normalized, changed } = normalizeProjects(data)
    if (changed) writeProjects(normalized)
    return sortByOrder(normalized)
  } catch {
    return []
  }
}

const writeProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

const readUnassignedProjectName = () => {
  const raw = localStorage.getItem(UNASSIGNED_NAME_KEY)
  if (!raw) return DEFAULT_UNASSIGNED_NAME
  const trimmed = raw.trim()
  return trimmed || DEFAULT_UNASSIGNED_NAME
}

const writeUnassignedProjectName = (name: string) => {
  localStorage.setItem(UNASSIGNED_NAME_KEY, name.trim() || DEFAULT_UNASSIGNED_NAME)
}

export const projectService = {
  getProjects() {
    return readProjects()
  },
  saveProjects(projects: Project[]) {
    writeProjects(projects)
  },
  reorderProjects(projects: Project[]) {
    const normalized = projects.map((project, index) => ({
      ...project,
      order: index,
    }))
    writeProjects(normalized)
    return normalized
  },
  getOrInitializeProjects() {
    const existing = readProjects()
    if (existing.length > 0) return existing
    writeProjects(sampleProjects)
    return sampleProjects
  },
  getUnassignedProjectName() {
    return readUnassignedProjectName()
  },
  saveUnassignedProjectName(name: string) {
    writeUnassignedProjectName(name)
  },
}
