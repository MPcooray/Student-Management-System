import React from 'react'

export default function StatCard({ icon: Icon, title, value, change, description, className = '' }) {
  return (
    <div className={`card card-hover ${className} transition transform duration-300 hover:shadow-card-md hover:-translate-y-1 animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">{title}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
          </div>
        </div>
        {/* percentage change badge removed as per UX request */}
      </div>
      {description && <p className="mt-3 text-xs text-gray-500">{description}</p>}
    </div>
  )
}
