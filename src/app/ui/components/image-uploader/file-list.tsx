import React from 'react'
import { Button } from '../button'
import { FileItem } from './file-item'

interface FileListProps {
  files: File[]
  maxFiles: number
  onRemoveFile: (index: number) => void
  onClearAll: () => void
}


export const FileList: React.FC<FileListProps> = ({ files, maxFiles, onRemoveFile, onClearAll }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-700">
        Archivos seleccionados ({files.length}/{maxFiles}):
      </h4>
      <Button
        type="button"
        onClick={onClearAll}
        className="text-xs bg-red-500 hover:bg-red-600"
      >
        Limpiar todo
      </Button>
    </div>
    
    <div className="space-y-2">
      {files.map((file, index) => (
        <FileItem
          key={index}
          file={file}
          onRemove={() => onRemoveFile(index)}
        />
      ))}
    </div>
  </div>
) 