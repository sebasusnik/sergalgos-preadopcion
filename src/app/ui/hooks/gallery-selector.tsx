import { useCallback, useState } from 'react'
import { useImageCompression } from './image-compression'

export const useGallerySelector = (
  onFilesChange: (files: File[]) => void, 
  files: File[], 
  maxFiles: number, 
  onError?: (error: string) => void,
  onProgress?: (progress: number) => void
) => {
  const { compressImages } = useImageCompression()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleGallerySelect = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = true
      input.style.display = 'none'
      
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
          const fileArray = Array.from(target.files)
          
          const totalFiles = files.length + fileArray.length
          if (totalFiles > maxFiles) {
            const errorMessage = `Máximo ${maxFiles} archivos permitidos`
            if (onError) {
              onError(errorMessage)
            }
            setIsProcessing(false)
            if (document.body.contains(input)) {
              document.body.removeChild(input)
            }
            return
          }
          
          try {
            const compressedFiles = await compressImages(fileArray, onProgress)
            onFilesChange([...files, ...compressedFiles])
          } catch (error) {
            console.error('Error processing gallery files:', error)
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
      
      input.onerror = () => {
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
  }, [files, onFilesChange, maxFiles, onError, onProgress, isProcessing, compressImages])

  return { handleGallerySelect, isProcessing }
}
