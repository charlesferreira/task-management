import { type KeyboardEvent, useRef, useState } from 'react'

type TimeCodeInputProps = {
  valueSeconds: number
  onChange: (nextSeconds: number) => void
  disabled?: boolean
  className?: string
}

type Segment = 'hours' | 'minutes' | 'seconds'

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const toTwoDigits = (value: number) => value.toString().padStart(2, '0')

const parseSegment = (raw: string, max: number) => {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return 0
  return clamp(Number.parseInt(digits.slice(0, 2), 10) || 0, 0, max)
}

const splitSeconds = (valueSeconds: number) => {
  const safeTotal = Math.max(0, Math.floor(valueSeconds))
  const hours = clamp(Math.floor(safeTotal / 3600), 0, 99)
  const minutes = Math.floor((safeTotal % 3600) / 60)
  const seconds = safeTotal % 60
  return { hours, minutes, seconds }
}

const TimeCodeInput = ({
  valueSeconds,
  onChange,
  disabled = false,
  className = '',
}: TimeCodeInputProps) => {
  const current = splitSeconds(valueSeconds)
  const initial = current
  const [hoursText, setHoursText] = useState(toTwoDigits(initial.hours))
  const [minutesText, setMinutesText] = useState(toTwoDigits(initial.minutes))
  const [secondsText, setSecondsText] = useState(toTwoDigits(initial.seconds))
  const [focusedSegment, setFocusedSegment] = useState<Segment | null>(null)
  const [editedSegment, setEditedSegment] = useState<Segment | null>(null)
  const displayHours =
    focusedSegment === 'hours' && editedSegment === 'hours'
      ? hoursText
      : toTwoDigits(current.hours)
  const displayMinutes =
    focusedSegment === 'minutes' && editedSegment === 'minutes'
      ? minutesText
      : toTwoDigits(current.minutes)
  const displaySeconds =
    focusedSegment === 'seconds' && editedSegment === 'seconds'
      ? secondsText
      : toTwoDigits(current.seconds)

  const hoursRef = useRef<HTMLInputElement | null>(null)
  const minutesRef = useRef<HTMLInputElement | null>(null)
  const secondsRef = useRef<HTMLInputElement | null>(null)

  const resolvedHoursText = editedSegment === 'hours' ? hoursText : toTwoDigits(current.hours)
  const resolvedMinutesText =
    editedSegment === 'minutes' ? minutesText : toTwoDigits(current.minutes)
  const resolvedSecondsText =
    editedSegment === 'seconds' ? secondsText : toTwoDigits(current.seconds)

  const emit = (nextHoursText: string, nextMinutesText: string, nextSecondsText: string) => {
    const hours = parseSegment(nextHoursText, 99)
    const minutes = parseSegment(nextMinutesText, 59)
    const seconds = parseSegment(nextSecondsText, 59)
    onChange(hours * 3600 + minutes * 60 + seconds)
  }

  const normalizeSegment = (segment: Segment) => {
    if (segment === 'hours') {
      const normalized = toTwoDigits(parseSegment(hoursText, 99))
      setHoursText(normalized)
      return
    }
    if (segment === 'minutes') {
      const normalized = toTwoDigits(parseSegment(minutesText, 59))
      setMinutesText(normalized)
      return
    }
    const normalized = toTwoDigits(parseSegment(secondsText, 59))
    setSecondsText(normalized)
  }

  const getRef = (segment: Segment) => {
    if (segment === 'hours') return hoursRef
    if (segment === 'minutes') return minutesRef
    return secondsRef
  }

  const focusSegment = (segment: Segment) => {
    const target = getRef(segment).current
    if (!target) return
    target.focus()
    target.select()
  }

  const adjustSegment = (segment: Segment, delta: number) => {
    if (segment === 'hours') {
      const next = clamp(parseSegment(resolvedHoursText, 99) + delta, 0, 99)
      const asText = toTwoDigits(next)
      setHoursText(asText)
      setEditedSegment('hours')
      emit(asText, resolvedMinutesText, resolvedSecondsText)
      return
    }
    if (segment === 'minutes') {
      const next = clamp(parseSegment(resolvedMinutesText, 59) + delta, 0, 59)
      const asText = toTwoDigits(next)
      setMinutesText(asText)
      setEditedSegment('minutes')
      emit(resolvedHoursText, asText, resolvedSecondsText)
      return
    }
    const next = clamp(parseSegment(resolvedSecondsText, 59) + delta, 0, 59)
    const asText = toTwoDigits(next)
    setSecondsText(asText)
    setEditedSegment('seconds')
    emit(resolvedHoursText, resolvedMinutesText, asText)
  }

  const handleChange = (segment: Segment, value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 2)

    if (segment === 'hours') {
      setHoursText(digitsOnly)
      setEditedSegment('hours')
      emit(digitsOnly, resolvedMinutesText, resolvedSecondsText)
      if (digitsOnly.length === 2) focusSegment('minutes')
      return
    }
    if (segment === 'minutes') {
      setMinutesText(digitsOnly)
      setEditedSegment('minutes')
      emit(resolvedHoursText, digitsOnly, resolvedSecondsText)
      if (digitsOnly.length === 2) focusSegment('seconds')
      return
    }
    setSecondsText(digitsOnly)
    setEditedSegment('seconds')
    emit(resolvedHoursText, resolvedMinutesText, digitsOnly)
  }

  const handleKeyDown = (segment: Segment, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      adjustSegment(segment, 1)
      focusSegment(segment)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      adjustSegment(segment, -1)
      focusSegment(segment)
    }
  }

  const segmentClass = (segment: Segment) =>
    `w-8 bg-transparent text-center font-mono text-sm text-slate-900 outline-none dark:text-slate-100 ${
      focusedSegment === segment ? 'text-slate-900 dark:text-slate-100' : ''
    }`

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-slate-200/70 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <input
        ref={hoursRef}
        value={displayHours}
        onChange={(event) => handleChange('hours', event.target.value)}
        onKeyDown={(event) => handleKeyDown('hours', event)}
        onFocus={(event) => {
          setHoursText(toTwoDigits(current.hours))
          setMinutesText(toTwoDigits(current.minutes))
          setSecondsText(toTwoDigits(current.seconds))
          setFocusedSegment('hours')
          setEditedSegment(null)
          event.currentTarget.select()
        }}
        onBlur={() => {
          normalizeSegment('hours')
          setFocusedSegment(null)
          setEditedSegment(null)
        }}
        inputMode="numeric"
        aria-label="Hours"
        disabled={disabled}
        className={segmentClass('hours')}
      />
      <span className="px-0.5 font-mono text-sm text-slate-500 dark:text-slate-400">:</span>
      <input
        ref={minutesRef}
        value={displayMinutes}
        onChange={(event) => handleChange('minutes', event.target.value)}
        onKeyDown={(event) => handleKeyDown('minutes', event)}
        onFocus={(event) => {
          setHoursText(toTwoDigits(current.hours))
          setMinutesText(toTwoDigits(current.minutes))
          setSecondsText(toTwoDigits(current.seconds))
          setFocusedSegment('minutes')
          setEditedSegment(null)
          event.currentTarget.select()
        }}
        onBlur={() => {
          normalizeSegment('minutes')
          setFocusedSegment(null)
          setEditedSegment(null)
        }}
        inputMode="numeric"
        aria-label="Minutes"
        disabled={disabled}
        className={segmentClass('minutes')}
      />
      <span className="px-0.5 font-mono text-sm text-slate-500 dark:text-slate-400">:</span>
      <input
        ref={secondsRef}
        value={displaySeconds}
        onChange={(event) => handleChange('seconds', event.target.value)}
        onKeyDown={(event) => handleKeyDown('seconds', event)}
        onFocus={(event) => {
          setHoursText(toTwoDigits(current.hours))
          setMinutesText(toTwoDigits(current.minutes))
          setSecondsText(toTwoDigits(current.seconds))
          setFocusedSegment('seconds')
          setEditedSegment(null)
          event.currentTarget.select()
        }}
        onBlur={() => {
          normalizeSegment('seconds')
          setFocusedSegment(null)
          setEditedSegment(null)
        }}
        inputMode="numeric"
        aria-label="Seconds"
        disabled={disabled}
        className={segmentClass('seconds')}
      />
    </div>
  )
}

export default TimeCodeInput
