export type Task = {
  id: string
  title: string
  projectId: string | null
  order: number
  completedAt: string | null
  description: string
  storyPoints: 1 | 2 | 3 | 5 | 8 | null
  actualTimeMinutes: number
  showInZen: boolean
}

export type TaskHistoryEventType =
  | 'task_created'
  | 'task_completed'
  | 'task_reopened'
  | 'task_updated'

export type TaskHistoryEvent = {
  id: string
  taskId: string
  eventType: TaskHistoryEventType
  fromCompletedAt: string | null
  toCompletedAt: string | null
  pointsSnapshot: 1 | 2 | 3 | 5 | 8 | null
  effortSnapshotMinutes: number
  occurredAt: string
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
