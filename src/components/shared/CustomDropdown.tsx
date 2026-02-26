import { useEffect, useRef, useState } from 'react'

export type DropdownOption<T extends string> = {
  value: T
  label: string
  toneClassName?: string
}

type CustomDropdownProps<T extends string> = {
  label: string
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  compact?: boolean
  className?: string
}

const CustomDropdown = <T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  compact = false,
  className = '',
}: CustomDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selected = options.find((option) => option.value === value) ?? options[0]
  const selectedIndex = options.findIndex((option) => option.value === value)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      setIsOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const focusIndex = selectedIndex >= 0 ? selectedIndex : 0
    const timer = window.setTimeout(() => {
      optionRefs.current[focusIndex]?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [isOpen, selectedIndex])

  const openAndFocus = (index: number) => {
    if (disabled) return
    setIsOpen(true)
    window.setTimeout(() => {
      optionRefs.current[index]?.focus()
    }, 0)
  }

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          if (disabled) return
          setIsOpen((open) => !open)
        }}
        onKeyDown={(event) => {
          if (disabled) return
          if (
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp' ||
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault()
          }
          if (event.key === 'ArrowDown') {
            const focusIndex = selectedIndex >= 0 ? selectedIndex : 0
            openAndFocus(focusIndex)
            return
          }
          if (event.key === 'ArrowUp') {
            const focusIndex =
              selectedIndex >= 0 ? selectedIndex : Math.max(options.length - 1, 0)
            openAndFocus(focusIndex)
            return
          }
          if (event.key === 'Enter' || event.key === ' ') {
            setIsOpen((open) => !open)
          }
        }}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg border border-slate-200/70 bg-white text-left text-slate-900 outline-none transition focus:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 ${
          compact ? 'gap-1 px-2 py-2 text-sm' : 'gap-2 px-3 py-2 text-sm'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
      >
        <span
          className={`truncate font-medium ${
            selected?.toneClassName ?? 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {selected?.label ?? '-'}
        </span>
        <span className="text-xs text-slate-400">▾</span>
      </button>
      {isOpen ? (
        <div
          role="listbox"
          aria-label={label}
          className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200/70 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-1">
            {options.map((option, index) => (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element
                }}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    const nextIndex = (index + 1) % options.length
                    optionRefs.current[nextIndex]?.focus()
                    return
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    const previousIndex = (index - 1 + options.length) % options.length
                    optionRefs.current[previousIndex]?.focus()
                    return
                  }
                  if (event.key === 'Home') {
                    event.preventDefault()
                    optionRefs.current[0]?.focus()
                    return
                  }
                  if (event.key === 'End') {
                    event.preventDefault()
                    optionRefs.current[options.length - 1]?.focus()
                    return
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setIsOpen(false)
                  }
                }}
                role="option"
                aria-selected={option.value === value}
                className={`flex w-full items-center rounded-lg px-2 py-1.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200/80 dark:focus-visible:ring-slate-500/70 ${
                  option.value === value
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span
                  className={
                    option.toneClassName ?? 'text-slate-700 dark:text-slate-200'
                  }
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CustomDropdown
