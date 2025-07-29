"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "../lib/utlis"

function RadioGroup({
  className,
  selectedValue,
  options,
  onChange,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  selectedValue?: string
  options?: Array<{value: string, label: string}>
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex gap-4", className)}
      value={selectedValue}
      onValueChange={(value) => {
        if (onChange) {
          // Create a synthetic event that matches the expected format
          const syntheticEvent = {
            target: {
              name: props.name,
              value: value
            }
          } as React.ChangeEvent<HTMLInputElement>
          onChange(syntheticEvent)
        }
      }}
      {...props}
    >
      {options?.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem value={option.value} id={`${props.name}-${option.value}`} />
          <label htmlFor={`${props.name}-${option.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
