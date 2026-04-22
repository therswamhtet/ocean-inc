import * as React from "react"
import { Calendar, Clock } from "lucide-react"

import { cn } from "@/lib/utils"

function formatDisplayDate(value: string) {
  if (!value) return ""
  const [y, m, d] = value.split("-")
  if (!y || !m || !d) return value
  return `${d}/${m}/${y}`
}

function parseDateInput(display: string) {
  const clean = display.replace(/\//g, "").replace(/\D/g, "")
  if (clean.length !== 8) return ""
  const d = clean.slice(0, 2)
  const m = clean.slice(2, 4)
  const y = clean.slice(4, 8)
  if (Number(m) > 12 || Number(d) > 31) return ""
  return `${y}-${m}-${d}`
}

const DateInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, value, defaultValue, onChange, onBlur, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLInputElement>(null)
    const [display, setDisplay] = React.useState(() =>
      formatDisplayDate(String(defaultValue ?? value ?? ""))
    )

    React.useImperativeHandle(forwardedRef, () => innerRef.current!)

    React.useEffect(() => {
      const v = String(value ?? "")
      if (v && v.includes("-")) {
        setDisplay(formatDisplayDate(v))
      }
    }, [value])

    return (
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-surface py-2 pr-10 pl-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={innerRef}
          value={display}
          {...props}
          onChange={(e) => {
            let raw = e.target.value.replace(/\D/g, "")
            if (raw.length > 8) raw = raw.slice(0, 8)

            let formatted = raw
            if (raw.length > 4) {
              formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`
            } else if (raw.length > 2) {
              formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`
            }

            setDisplay(formatted)

            const iso = parseDateInput(formatted)
            if (onChange && iso) {
              const synthetic = { ...e, target: { ...e.target, value: iso } }
              onChange(synthetic as React.ChangeEvent<HTMLInputElement>)
            }
          }}
          onBlur={(e) => {
            const iso = parseDateInput(display)
            if (iso) {
              setDisplay(formatDisplayDate(iso))
              if (onBlur) {
                const synthetic = { ...e, target: { ...e.target, value: iso } }
                onBlur(synthetic as React.FocusEvent<HTMLInputElement>)
              }
            }
          }}
        />
        <Calendar
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
      </div>
    )
  }
)
DateInput.displayName = "DateInput"

function formatDisplayTime(value: string) {
  if (!value) return ""
  const [h, m] = value.split(":")
  if (!h || !m) return value
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`
}

function parseTimeInput(display: string) {
  const clean = display.toUpperCase().replace(/\s/g, "")
  const match = clean.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/)
  if (!match) return ""
  let h = parseInt(match[1], 10)
  const m = match[2]
  const ampm = match[3]
  if (h > 12 || parseInt(m, 10) > 59) return ""
  if (ampm === "PM" && h < 12) h += 12
  if (ampm === "AM" && h === 12) h = 0
  return `${String(h).padStart(2, "0")}:${m}`
}

const TimeInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, value, defaultValue, onChange, onBlur, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLInputElement>(null)
    const [display, setDisplay] = React.useState(() =>
      formatDisplayTime(String(defaultValue ?? value ?? ""))
    )

    React.useImperativeHandle(forwardedRef, () => innerRef.current!)

    React.useEffect(() => {
      const v = String(value ?? "")
      if (v && v.includes(":")) {
        setDisplay(formatDisplayTime(v))
      }
    }, [value])

    return (
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="hh:mm AM"
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-surface py-2 pr-10 pl-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={innerRef}
          value={display}
          {...props}
          onChange={(e) => {
            setDisplay(e.target.value)
            const iso = parseTimeInput(e.target.value)
            if (onChange && iso) {
              const synthetic = { ...e, target: { ...e.target, value: iso } }
              onChange(synthetic as React.ChangeEvent<HTMLInputElement>)
            }
          }}
          onBlur={(e) => {
            const iso = parseTimeInput(display)
            if (iso) {
              setDisplay(formatDisplayTime(iso))
              if (onBlur) {
                const synthetic = { ...e, target: { ...e.target, value: iso } }
                onBlur(synthetic as React.FocusEvent<HTMLInputElement>)
              }
            }
          }}
        />
        <Clock
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
      </div>
    )
  }
)
TimeInput.displayName = "TimeInput"

export { DateInput, TimeInput }
