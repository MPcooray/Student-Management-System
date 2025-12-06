import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import StudentDashboard from './pages/StudentDashboard'
import StudentsList from './pages/StudentsList'
import StudentForm from './pages/StudentForm'
import StudentDetail from './pages/StudentDetail'
import CoursesPage from './pages/CoursesPage'
import Login from './pages/Login'
import Register from './pages/Register'

export default function RoutesApp(){
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route 
          path="students" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <StudentsList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="students/new" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <StudentForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="students/:id" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <StudentDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="student-dashboard" 
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="courses" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <CoursesPage />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  )
}
