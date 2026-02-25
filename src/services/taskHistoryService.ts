import type { TaskHistoryEvent } from '../models/types'

const STORAGE_KEY = 'taskOrganizer.taskHistory'

const readEvents = (): TaskHistoryEvent[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as TaskHistoryEvent[]
    if (!Array.isArray(data)) return []
    return data.filter(
      (event) =>
        typeof event.id === 'string' &&
        typeof event.taskId === 'string' &&
        typeof event.eventType === 'string' &&
        typeof event.occurredAt === 'string',
    )
  } catch {
    return []
  }
}

const writeEvents = (events: TaskHistoryEvent[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

export const taskHistoryService = {
  getEvents() {
    return readEvents().sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
  },
  appendEvent(event: TaskHistoryEvent) {
    const current = readEvents()
    const next = [...current, event]
    writeEvents(next)
    return next
  },
  saveEvents(events: TaskHistoryEvent[]) {
    writeEvents(events)
  },
}
