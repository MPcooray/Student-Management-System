import React from 'react'

export default function Skeleton({ className = '', width = 'w-full', height = 'h-4', rounded = 'rounded-md' }) {
  return (
    <div className={`bg-gray-200/60 ${width} ${height} ${rounded} animate-pulse ${className}`}></div>
  )
}
