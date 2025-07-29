import React from 'react'
import { Upload } from 'lucide-react'
import { Button } from '../button'

interface DropzoneAreaProps {
  getRootProps: any
  getInputProps: any
  isDragActive: boolean
  isDragReject: boolean
  isProcessing: boolean
  filesLength: number
  maxFiles: number
  onGallerySelect: (e: React.MouseEvent) => void
} 

export const DropzoneArea: React.FC<DropzoneAreaProps> = ({ 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  isDragReject, 
  isProcessing, 
  filesLength, 
  maxFiles, 
  onGallerySelect 
}) => (
  <div
    {...getRootProps()}
    className={`
      border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
      ${isDragActive 
        ? 'border-blue-400 bg-blue-50' 
        : isDragReject 
          ? 'border-red-400 bg-red-50'
          : 'border-gray-300 hover:border-gray-400'
      }
      ${filesLength >= maxFiles || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    <input {...getInputProps()} />
    
    <div className="flex flex-col items-center space-y-4">
      <Upload className="h-12 w-12 text-gray-400" />
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          {isProcessing 
            ? 'Procesando...' 
            : isDragActive 
              ? 'Suelta las fotos aquí...' 
              : 'Arrastra las fotos aquí o toca para seleccionar'
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            type="button"
            onClick={onGallerySelect}
            className="flex items-center gap-2 px-4 py-2 text-sm"
            disabled={filesLength >= maxFiles || isProcessing}
          >
            <Upload className="h-4 w-4" />
            Seleccionar de galería
          </Button>
        </div>
      </div>
      
      {filesLength >= maxFiles && (
        <p className="text-xs text-orange-600">
          Límite de archivos alcanzado
        </p>
      )}
    </div>
  </div>
) 