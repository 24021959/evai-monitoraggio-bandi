
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { it } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  buttonClassName?: string
  classNames?: {
    trigger?: string
    content?: string
    calendar?: string
  }
  triggerIcon?: React.ReactNode
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleziona una data",
  className,
  buttonClassName,
  classNames,
  triggerIcon = <CalendarIcon className="h-4 w-4" />
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            classNames?.trigger,
            buttonClassName
          )}
        >
          {triggerIcon}
          {date ? (
            format(date, "dd/MM/yyyy", { locale: it })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", classNames?.content)}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          locale={it}
          className={classNames?.calendar}
        />
        {date && (
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onDateChange(undefined)}
            >
              Azzera data
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
