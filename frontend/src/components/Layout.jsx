import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../services/auth'

export default function Layout() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    // Check both token and user to ensure authentication is valid
    function checkAuth() {
      try {
        const token = localStorage.getItem('token')
        const raw = localStorage.getItem('user')
        if (token && raw) {
          setUser(JSON.parse(raw))
        } else {
          setUser(null)
          // Clear any stale data
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch(e) { 
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    checkAuth()
    
    // listen for auth changes made elsewhere in the app (login/logout)
    function onAuthChanged(){
      checkAuth()
    }

    window.addEventListener('authChanged', onAuthChanged)
    return () => window.removeEventListener('authChanged', onAuthChanged)
  }, [])

  function handleLogout(){
    logout()
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    // Clear browser history and prevent back button access
    window.history.replaceState(null, '', '/')
    navigate('/', { replace: true })
    // Force a page reload to clear any cached state
    window.location.href = '/'
  }

  return (
    <div className={`min-h-screen ${isHomePage ? 'bg-transparent overflow-hidden' : 'page-background'}`}>
      <header className={`${isHomePage ? 'nav-gradient-header' : 'bg-white/90 backdrop-blur-sm shadow-sm'} relative z-30`}>
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className={`text-lg font-semibold tracking-tight ${isHomePage ? 'text-white' : 'text-gray-900'} transition-opacity hover:opacity-80`}>
            Student Management System
          </Link>
          <nav className="flex items-center gap-1">
            {user && user.role === 'Admin' && (
              <>
                <Link to="/dashboard" className={`nav-link ${isHomePage ? 'nav-link-home' : 'nav-link-default'}`}>Dashboard</Link>
                <Link to="/students" className={`nav-link ${isHomePage ? 'nav-link-home' : 'nav-link-default'}`}>Students</Link>
                <Link to="/courses" className={`nav-link ${isHomePage ? 'nav-link-home' : 'nav-link-default'}`}>Courses</Link>
              </>
            )}

            {user ? (
              <div className="ml-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${isHomePage ? 'bg-white/20' : 'bg-gray-200'} flex items-center justify-center`}>
                    <span className={`text-xs font-medium ${isHomePage ? 'text-white' : 'text-gray-700'}`}>
                      {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isHomePage ? 'text-white/90' : 'text-gray-700'}`}>
                    {user.firstName || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-all ${isHomePage ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="ml-4 flex items-center gap-2">
                <Link to="/login" className={`nav-button ${isHomePage ? 'nav-button-home' : 'nav-button-default'}`}>
                  Sign In
                </Link>
                <Link to="/register" className={`nav-button ${isHomePage ? 'nav-button-register-home' : 'nav-button-register-default'}`}>
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className={`${isHomePage ? 'relative min-h-screen' : 'container py-6'}`}>
        <Outlet />
      </main>
    </div>
  )
}
