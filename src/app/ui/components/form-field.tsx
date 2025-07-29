import React from 'react'
import { Label } from './label'

interface FormFieldProps {
  id: string
  label: string
  children: React.ReactNode
  required?: boolean
}

export const FormField: React.FC<FormFieldProps> = ({ id, label, children, required = false }) => (
  <div className="grid w-full items-center gap-2">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {children}
  </div>
) 