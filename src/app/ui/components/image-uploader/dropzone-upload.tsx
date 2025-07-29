import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useImageCompression } from '../../hooks/image-compression'
import { useGallerySelector } from '../../hooks/gallery-selector'
import { DropzoneArea } from './dropzone-area'
import { ErrorDisplay } from './error-display'
import { FileList } from './file-list'
import { Progress } from './progress-bar'

interface DropzoneUploadProps {
  onFilesChange: (files: File[]) => void
  files: File[]
  error?: string
  onError?: (error: string) => void
  maxSize?: number // in bytes
  maxFiles?: number
}

// Main component
export function DropzoneUpload({
  onFilesChange,
  files,
  error,
  onError,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 10
}: DropzoneUploadProps) {
  const [localError, setLocalError] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const { compressImages } = useImageCompression()
  const { handleGallerySelect, isProcessing } = useGallerySelector(
    onFilesChange, 
    files, 
    maxFiles, 
    onError,
    setProgress
  )

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

    if (acceptedFiles.length > 0) {
      try {
        const compressedFiles = await compressImages(acceptedFiles, setProgress)
        onFilesChange([...files, ...compressedFiles])
      } catch (error) {
        console.error('Error processing files:', error)
        onFilesChange([...files, ...acceptedFiles])
      }
    }
  }, [files, onFilesChange, maxSize, onError, compressImages])

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

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const clearAllFiles = () => {
    onFilesChange([])
    setLocalError('')
    setProgress(0)
    if (onError) {
      onError('')
    }
  }

  const clearError = () => {
    setLocalError('')
    if (onError) onError('')
  }

  const displayError = error || localError

  return (
    <div className="space-y-4">
      <DropzoneArea
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        isDragReject={isDragReject}
        isProcessing={isProcessing}
        filesLength={files.length}
        maxFiles={maxFiles}
        onGallerySelect={handleGallerySelect}
      />

      <Progress value={progress} className={`-mt-2 ${isProcessing ? 'opacity-100' : 'opacity-0'}`}/>

      {displayError && (
        <ErrorDisplay error={displayError} onClear={clearError} />
      )}

      {files.length > 0 && (
        <FileList
          files={files}
          maxFiles={maxFiles}
          onRemoveFile={removeFile}
          onClearAll={clearAllFiles}
        />
      )}
    </div>
  )
} 