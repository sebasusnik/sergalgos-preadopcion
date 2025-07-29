import React from 'react'
import { Label } from './label'

interface FormFieldProps {
  id: string
  label: string
  children: React.ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({ id, label, children }) => (
  <div className="grid w-full items-center gap-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
) 