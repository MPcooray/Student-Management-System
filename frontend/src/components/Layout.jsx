import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="text-xl font-semibold text-primary">StudentMgmt</Link>
          <nav className="space-x-4">
            <Link to="/students" className="text-sm text-gray-600 hover:text-primary">Students</Link>
            <Link to="/courses" className="text-sm text-gray-600 hover:text-primary">Courses</Link>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  )
}
