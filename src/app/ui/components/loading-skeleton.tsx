import React from 'react'

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-0 sm:p-6 md:p-8 bg-gray-50">
      <div className="w-full max-w-3xl bg-white p-4 sm:p-8 rounded-none sm:rounded-xl shadow-none sm:shadow-lg">
        <div className="text-center mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2 mx-auto"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Personal Info Section Skeleton */}
          <div className="space-y-4 p-5 border border-gray-200 rounded-lg">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Questions Section Skeleton */}
          <div className="space-y-4 p-5 border border-gray-200 rounded-lg">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Submit Button Skeleton */}
          <div className="flex justify-end">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 