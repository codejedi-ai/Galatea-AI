import React, { useState } from 'react'
import { cn } from "@/lib/utils"
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
          onBlur={() => setIsOpen(false)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={cn(
          "absolute right-3 top-3 h-4 w-4 opacity-50 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
