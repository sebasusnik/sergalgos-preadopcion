export const useImageCompression = () => {
  const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
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
        
        URL.revokeObjectURL(img.src)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const compressImages = async (files: File[], onProgress?: (progress: number) => void): Promise<File[]> => {
    const compressedFiles: File[] = []
    const totalFiles = files.length
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        if (file.type.startsWith('image/')) {
          const compressedFile = await compressImage(file)
          compressedFiles.push(compressedFile)
        } else {
          compressedFiles.push(file)
        }
      } catch (error) {
        console.error('Error compressing file:', file.name, error)
        compressedFiles.push(file)
      }
      
      // Report progress after each file is processed
      if (onProgress) {
        const progress = ((i + 1) / totalFiles) * 100
        onProgress(progress)
      }
    }
    
    return compressedFiles
  }

  return { compressImages }
}
