import React from 'react'

export default function SectionCard({ title, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div>{children}</div>
    </section>
  )
}
