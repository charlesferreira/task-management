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
        className={`flex w-full items-center justify-between rounded-lg border border-slate-200/70 bg-white text-left text-slate-900 outline-none transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-sky-500/70 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:focus-visible:ring-sky-400/70 ${
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
        <span className={`text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          ▾
        </span>
      </button>
      {isOpen ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200/70 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <ul role="listbox" aria-label={label}>
            {options.map((option, index) => (
              <li key={option.value}>
                <button
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
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    option.value === value
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : ''
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
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default CustomDropdown
