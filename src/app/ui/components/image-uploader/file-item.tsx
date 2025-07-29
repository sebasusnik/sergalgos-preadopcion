import React from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '../button'

interface FileItemProps {
  file: File
  onRemove: () => void
}

export const FileItem: React.FC<FileItemProps> = ({ file, onRemove }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
        {file.type.startsWith('image/') ? (
          <>
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <span className="text-xs text-gray-500 hidden">
              {file.name.split('.').pop()?.toUpperCase() || 'IMG'}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-500">
            {file.name.split('.').pop()?.toUpperCase() || 'IMG'}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {(file.size / 1024 / 1024).toFixed(1)} MB
          {file.type === 'image/jpeg' && file.size < 1024 * 1024 && (
            <span className="text-green-600 ml-1">✓ Cargado</span>
          )}
        </p>
      </div>
    </div>
    <Button
      type="button"
      onClick={onRemove}
      className="p-1 h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
    >
      <Trash2 size={14} />
    </Button>
  </div>
) 