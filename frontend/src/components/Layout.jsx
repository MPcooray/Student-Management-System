import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'

export default function Layout() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setUser(JSON.parse(raw))
    } catch(e) { setUser(null) }
    // listen for auth changes made elsewhere in the app (login/logout)
    function onAuthChanged(){
      try {
        const raw = localStorage.getItem('user')
        setUser(raw ? JSON.parse(raw) : null)
      } catch(e) { setUser(null) }
    }

    window.addEventListener('authChanged', onAuthChanged)
    return () => window.removeEventListener('authChanged', onAuthChanged)
  }, [])

  function handleLogout(){
    logout()
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="text-xl font-semibold text-primary">Student Management System</Link>
          <nav className="space-x-4 flex items-center">
            {user && user.role === 'Admin' && (
              <>
                <Link to="/students" className="text-sm text-gray-600 hover:text-primary">Students</Link>
                <Link to="/courses" className="text-sm text-gray-600 hover:text-primary">Courses</Link>
              </>
            )}

            {user ? (
              <div className="ml-4 flex items-center gap-3">
                <span className="text-sm text-gray-700">{user.firstName || user.email}</span>
                <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
              </div>
            ) : (
              <div className="ml-4">
                <Link to="/login" className="text-sm text-blue-600 hover:underline mr-2">Login</Link>
                <Link to="/register" className="text-sm text-blue-600 hover:underline">Register</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  )
}
