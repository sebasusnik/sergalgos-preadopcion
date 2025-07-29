import React, { useRef, useState, useEffect } from 'react'
import { Camera, Upload, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from './button'

interface MobileFileUploadProps {
  onFilesChange: (files: File[]) => void
  files: File[]
  error?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  onError?: (error: string) => void
}

export function MobileFileUpload({
  onFilesChange,
  files,
  error,
  accept = "image/*",
  multiple = true,
  maxSize = 5 * 1024 * 1024, // 5MB default
  onError
}: MobileFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [localError, setLocalError] = useState<string>('')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const fileArray = Array.from(selectedFiles)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size)
      
      // Check file type
      if (accept !== "*" && !file.type.match(accept.replace("*", ".*"))) {
        const errorMsg = `${file.name}: tipo de archivo no permitido (${file.type})`
        errors.push(errorMsg)
        console.error(errorMsg)
        return
      }

      // Check file size
      if (file.size > maxSize) {
        const errorMsg = `${file.name}: archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB, máximo ${(maxSize / 1024 / 1024).toFixed(1)}MB)`
        errors.push(errorMsg)
        console.error(errorMsg)
        return
      }

      validFiles.push(file)
      console.log('Valid file added:', file.name)
    })

    if (errors.length > 0) {
      const errorMessage = errors.join('\n')
      setLocalError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
      console.error('File validation errors:', errors)
    } else {
      setLocalError('')
      if (onError) {
        onError('')
      }
    }

    if (validFiles.length > 0) {
      console.log('Adding valid files:', validFiles.map(f => f.name))
      onFilesChange(multiple ? [...files, ...validFiles] : validFiles)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change detected')
    handleFileSelect(e.target.files)
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = ''
    }
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current && isMounted) {
      console.log('Camera capture triggered')
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const handleGallerySelect = () => {
    if (fileInputRef.current && isMounted) {
      console.log('Gallery selection triggered')
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  const displayError = error || localError

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Arrastra las fotos aquí o
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                type="button"
                onClick={handleGallerySelect}
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Upload className="h-4 w-4" />
                Seleccionar de galería
              </Button>
              
              <Button
                type="button"
                onClick={handleCameraCapture}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700"
              >
                <Camera className="h-4 w-4" />
                Tomar foto
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Formatos: JPG, PNG, WebP • Máximo {maxSize / 1024 / 1024}MB por archivo
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error Display */}
      {displayError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600 whitespace-pre-line">{displayError}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Archivos seleccionados ({files.length}):
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      {file.name.split('.').pop()?.toUpperCase() || 'IMG'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 