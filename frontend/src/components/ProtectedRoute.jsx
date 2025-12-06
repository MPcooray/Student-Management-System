import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const location = useLocation()
  
  // Check both token and user for authentication
  const token = localStorage.getItem('token')
  const user = getCurrentUser()
  const isAuthenticated = !!(token && user)

  useEffect(() => {
    // Clear any cached data if user is not authenticated
    if (!isAuthenticated) {
      // Force clear any remaining auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Replace current history entry to prevent back button
      window.history.replaceState(null, '', '/login')
    }
  }, [isAuthenticated])

  // If not authenticated, redirect to login and replace history
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If role is required and user doesn't have it, redirect
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

