import React from 'react'
import { Button } from './button'

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="text-sm text-gray-600 mb-4">
        {children}
      </div>
      <Button onClick={onClose}>Cerrar</Button>
    </div>
  </div>
) 