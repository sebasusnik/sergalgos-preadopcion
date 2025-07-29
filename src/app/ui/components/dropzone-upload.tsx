import React, { useCallback, useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, AlertCircle, Trash2, X, Bug } from 'lucide-react'
import { Button } from './button'

interface DropzoneUploadProps {
  onFilesChange: (files: File[]) => void
  files: File[]
  error?: string
  onError?: (error: string) => void
  maxSize?: number // in bytes
  maxFiles?: number
  debug?: boolean
}

export function DropzoneUpload({
  onFilesChange,
  files,
  error,
  onError,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 10,
  debug = process.env.NODE_ENV === 'development'
}: DropzoneUploadProps) {
  const [localError, setLocalError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debug logging function
  const addDebugLog = (message: string) => {
    if (debug) {
      const timestamp = new Date().toLocaleTimeString()
      const logMessage = `[${timestamp}] ${message}`
      console.log(logMessage)
      setDebugLogs(prev => [...prev.slice(-9), logMessage]) // Keep last 10 logs
    }
  }

  // Debug logging
  useEffect(() => {
    if (debug) {
      addDebugLog(`Component state: files=${files.length}, processing=${isProcessing}, errors=${localError ? 'yes' : 'no'}`)
    }
  }, [files, localError, isProcessing, debug])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    addDebugLog(`onDrop called: accepted=${acceptedFiles.length}, rejected=${rejectedFiles.length}`)

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

    // Add accepted files
    if (acceptedFiles.length > 0) {
      onFilesChange([...files, ...acceptedFiles])
    }
  }, [files, onFilesChange, maxSize, onError, debug])

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

  const handleGallerySelect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addDebugLog('handleGallerySelect called')
    
    if (isProcessing) {
      addDebugLog('Already processing, ignoring click')
      return
    }
    
    setIsProcessing(true)
    addDebugLog('Set processing to true')
    
    try {
      // Create a new file input for gallery selection
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.style.display = 'none'
      
      addDebugLog('Created file input element')
      
      input.onchange = (event) => {
        addDebugLog('File input onchange triggered')
        
        const target = event.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
          const fileArray = Array.from(target.files)
          addDebugLog(`Files selected: ${fileArray.map(f => f.name).join(', ')}`)
          
          // Check if adding these files would exceed maxFiles
          const totalFiles = files.length + fileArray.length
          if (totalFiles > maxFiles) {
            addDebugLog(`Too many files: ${totalFiles} > ${maxFiles}`)
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
          
          // Add new files to existing files
          onFilesChange([...files, ...fileArray])
        } else {
          addDebugLog('No files selected')
        }
        setIsProcessing(false)
        addDebugLog('Set processing to false')
        if (document.body.contains(input)) {
          document.body.removeChild(input)
          addDebugLog('Removed input from DOM')
        }
      }
      
      input.oncancel = () => {
        addDebugLog('File input cancelled')
        setIsProcessing(false)
        if (document.body.contains(input)) {
          document.body.removeChild(input)
        }
      }
      
      // Add error handling
      input.onerror = (error) => {
        addDebugLog(`File input error: ${error}`)
        setIsProcessing(false)
        if (document.body.contains(input)) {
          document.body.removeChild(input)
        }
      }
      
      document.body.appendChild(input)
      addDebugLog('Added input to DOM and clicking')
      input.click()
    } catch (error) {
      addDebugLog(`Error in handleGallerySelect: ${error}`)
      setIsProcessing(false)
    }
  }

  const removeFile = (index: number) => {
    addDebugLog(`Removing file at index: ${index}`)
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const clearAllFiles = () => {
    addDebugLog('Clearing all files')
    onFilesChange([])
    setLocalError('')
    if (onError) {
      onError('')
    }
  }

  const clearDebugLogs = () => {
    setDebugLogs([])
  }

  const displayError = error || localError

  return (
    <div className="space-y-4">
      {/* Debug Panel */}
      {debug && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-yellow-600" />
              <h4 className="text-sm font-medium text-yellow-800">Debug Info</h4>
            </div>
            <Button
              type="button"
              onClick={clearDebugLogs}
              className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1"
            >
              Limpiar logs
            </Button>
          </div>
          
          <div className="text-xs text-yellow-700 space-y-1 mb-3">
            <p>Files: {files.length}/{maxFiles}</p>
            <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
            <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
            <p>Mobile: {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}</p>
            <p>Max Size: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
            {localError && <p>Local Error: {localError}</p>}
            {error && <p>Prop Error: {error}</p>}
          </div>

          {/* Debug Logs */}
          <div className="bg-black text-green-400 p-2 rounded text-xs font-mono max-h-40 overflow-y-auto">
            <div className="mb-1 text-white">Debug Logs:</div>
            {debugLogs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
                ? 'Procesando...' 
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
          </p>
          
          {files.length >= maxFiles && (
            <p className="text-xs text-orange-600">
              Límite de archivos alcanzado
            </p>
          )}
          
          {isProcessing && (
            <p className="text-xs text-blue-600">
              Procesando archivos...
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