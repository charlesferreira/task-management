const HOURS_MINUTES_PATTERN = /^(?:(\d+)h)?\s*(?:(\d+)m)?$/i

export const parseHoursMinutesInput = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    return { isValid: true, minutes: 0 }
  }

  const match = normalized.match(HOURS_MINUTES_PATTERN)
  if (!match) {
    return { isValid: false, minutes: 0 }
  }

  const [, hoursRaw, minutesRaw] = match
  if (!hoursRaw && !minutesRaw) {
    return { isValid: false, minutes: 0 }
  }

  const hours = hoursRaw ? Number.parseInt(hoursRaw, 10) : 0
  const minutes = minutesRaw ? Number.parseInt(minutesRaw, 10) : 0

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return { isValid: false, minutes: 0 }
  }

  if (minutes >= 60) {
    return { isValid: false, minutes: 0 }
  }

  return { isValid: true, minutes: hours * 60 + minutes }
}

export const formatMinutesAsHoursMinutes = (totalMinutes: number) => {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes))
  const hours = Math.floor(safeMinutes / 60)
  const minutes = safeMinutes % 60

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

export const formatMinutesAsClock = (minutes: number) => {
  const totalSeconds = Math.max(0, Math.floor(minutes * 60))
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0')
  const mins = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const secs = (totalSeconds % 60).toString().padStart(2, '0')
  return `${hours}:${mins}:${secs}`
}
