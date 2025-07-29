import React, { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, AlertCircle, Trash2, X } from 'lucide-react'
import { Button } from './button'

interface DropzoneUploadProps {
  onFilesChange: (files: File[]) => void
  files: File[]
  error?: string
  onError?: (error: string) => void
  maxSize?: number // in bytes
  maxFiles?: number
}

// Image compression function
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      
      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Batch compress images
const compressImages = async (files: File[]): Promise<File[]> => {
  const compressedFiles: File[] = []
  
  for (const file of files) {
    try {
      // Only compress image files
      if (file.type.startsWith('image/')) {
        const compressedFile = await compressImage(file)
        compressedFiles.push(compressedFile)
      } else {
        // Keep non-image files as-is
        compressedFiles.push(file)
      }
    } catch (error) {
      console.error('Error compressing file:', file.name, error)
      // If compression fails, use original file
      compressedFiles.push(file)
    }
  }
  
  return compressedFiles
}

export function DropzoneUpload({
  onFilesChange,
  files,
  error,
  onError,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 10
}: DropzoneUploadProps) {
  const [localError, setLocalError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(({ file, errors }) => {
        const errorList = errors.map((error: any) => {
          if (error.code === 'file-too-large') {
            return `${file.name}: archivo demasiado grande (máximo ${(maxSize / 1024 / 1024).toFixed(1)}MB)`
          }
          if (error.code === 'file-invalid-type') {
            return `${file.name}: tipo de archivo no permitido`
          }
          return `${file.name}: ${error.message}`
        }).join('\n')
        return errorList
      }).join('\n')

      setLocalError(errorMessages)
      if (onError) {
        onError(errorMessages)
      }
    } else {
      setLocalError('')
      if (onError) {
        onError('')
      }
    }

    // Compress and add accepted files
    if (acceptedFiles.length > 0) {
      setIsProcessing(true)
      try {
        const compressedFiles = await compressImages(acceptedFiles)
        onFilesChange([...files, ...compressedFiles])
      } catch (error) {
        console.error('Error processing files:', error)
        // If compression fails, use original files
        onFilesChange([...files, ...acceptedFiles])
      } finally {
        setIsProcessing(false)
      }
    }
  }, [files, onFilesChange, maxSize, onError])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxSize: maxSize,
    maxFiles: maxFiles,
    disabled: files.length >= maxFiles || isProcessing
  })

  const handleGallerySelect = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
      // Create a new file input for gallery selection
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.style.display = 'none'
      
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
          const fileArray = Array.from(target.files)
          
          // Check if adding these files would exceed maxFiles
          const totalFiles = files.length + fileArray.length
          if (totalFiles > maxFiles) {
            setLocalError(`Máximo ${maxFiles} archivos permitidos`)
            if (onError) {
              onError(`Máximo ${maxFiles} archivos permitidos`)
            }
            setIsProcessing(false)
            if (document.body.contains(input)) {
              document.body.removeChild(input)
            }
            return
          }
          
          try {
            // Compress files before adding
            const compressedFiles = await compressImages(fileArray)
            onFilesChange([...files, ...compressedFiles])
          } catch (error) {
            console.error('Error processing gallery files:', error)
            // If compression fails, use original files
            onFilesChange([...files, ...fileArray])
          }
        }
        setIsProcessing(false)
        if (document.body.contains(input)) {
          document.body.removeChild(input)
        }
      }
      
      input.oncancel = () => {
        setIsProcessing(false)
        if (document.body.contains(input)) {
          document.body.removeChild(input)
        }
      }
      
      // Add error handling
      input.onerror = (error) => {
        setIsProcessing(false)
        if (document.body.contains(input)) {
          document.body.removeChild(input)
        }
      }
      
      document.body.appendChild(input)
      input.click()
    } catch (error) {
      setIsProcessing(false)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const clearAllFiles = () => {
    onFilesChange([])
    setLocalError('')
    if (onError) {
      onError('')
    }
  }

  const displayError = error || localError

  return (
    <div className="space-y-4">
      {/* Dropzone Area */}
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
          ${files.length >= maxFiles || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {isProcessing 
                ? 'Procesando y comprimiendo...' 
                : isDragActive 
                  ? 'Suelta las fotos aquí...' 
                  : 'Arrastra las fotos aquí o toca para seleccionar'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                type="button"
                onClick={handleGallerySelect}
                className="flex items-center gap-2 px-4 py-2 text-sm"
                disabled={files.length >= maxFiles || isProcessing}
              >
                <Upload className="h-4 w-4" />
                Seleccionar de galería
              </Button>

            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Formatos: JPG, PNG, WebP • Máximo {maxSize / 1024 / 1024}MB por archivo
            {maxFiles > 1 && ` • Máximo ${maxFiles} archivos`}
            <br />
            <span className="text-blue-600">Las imágenes se comprimirán automáticamente para optimizar el envío</span>
          </p>
          
          {files.length >= maxFiles && (
            <p className="text-xs text-orange-600">
              Límite de archivos alcanzado
            </p>
          )}
          
          {isProcessing && (
            <p className="text-xs text-blue-600">
              Comprimiendo imágenes...
            </p>
          )}
        </div>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600 whitespace-pre-line flex-1">{displayError}</p>
          <Button
            type="button"
            onClick={() => {
              setLocalError('')
              if (onError) onError('')
            }}
            className="p-1 h-6 w-6 bg-red-500 hover:bg-red-600 text-white"
          >
            <X size={12} />
          </Button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Archivos seleccionados ({files.length}/{maxFiles}):
            </h4>
            <Button
              type="button"
              onClick={clearAllFiles}
              className="text-xs bg-red-500 hover:bg-red-600"
            >
              Limpiar todo
            </Button>
          </div>
          
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
                      {file.type === 'image/jpeg' && file.size < 1024 * 1024 && (
                        <span className="text-green-600 ml-1">✓ Comprimido</span>
                      )}
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