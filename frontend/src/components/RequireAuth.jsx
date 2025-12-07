import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'

export default function RequireAuth({ children, requiredRole = null }) {
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const user = getCurrentUser()
    const authenticated = !!(token && user)
    
    setIsAuthenticated(authenticated)
    setIsChecking(false)
    
    // Clear any cached data if user is not authenticated
    if (!authenticated) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Replace current history entry to prevent back button
      window.history.replaceState(null, '', '/login')
    }
  }, [location.pathname])

  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // If not authenticated, redirect to login and replace history
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const user = getCurrentUser()
  
  // If role is required and user doesn't have it, redirect
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}


