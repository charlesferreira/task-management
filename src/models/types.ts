export type Task = {
  id: string
  title: string
  projectId: string | null
  order: number
  completedAt: string | null
}

export type Project = {
  id: string
  name: string
  color: string
  order: number
}

export const UNASSIGNED_PROJECT_ID = 'unassigned'

export const UNASSIGNED_PROJECT: Project = {
  id: UNASSIGNED_PROJECT_ID,
  name: 'Unassigned',
  color: '#94a3b8',
  order: Number.MAX_SAFE_INTEGER,
}
