import React from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '../button'

interface ErrorDisplayProps {
  error: string
  onClear: () => void
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClear }) => (
  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="h-4 w-4 text-red-500" />
    <p className="text-sm text-red-600 whitespace-pre-line flex-1">{error}</p>
    <Button
      type="button"
      onClick={onClear}
      className="p-1 h-6 w-6 bg-red-500 hover:bg-red-600 text-white"
    >
      <X size={12} />
    </Button>
  </div>
) 