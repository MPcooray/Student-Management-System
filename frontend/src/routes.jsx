import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
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
            <RequireAuth requiredRole="Admin">
              <StudentsList />
            </RequireAuth>
          } 
        />
        <Route 
          path="students/new" 
          element={
            <RequireAuth requiredRole="Admin">
              <StudentForm />
            </RequireAuth>
          } 
        />
        <Route 
          path="students/:id" 
          element={
            <RequireAuth requiredRole="Admin">
              <StudentDetail />
            </RequireAuth>
          } 
        />
        <Route 
          path="dashboard" 
          element={
            <RequireAuth requiredRole="Admin">
              <Dashboard />
            </RequireAuth>
          } 
        />
        <Route 
          path="student-dashboard" 
          element={
            <RequireAuth>
              <StudentDashboard />
            </RequireAuth>
          } 
        />
        <Route 
          path="courses" 
          element={
            <RequireAuth requiredRole="Admin">
              <CoursesPage />
            </RequireAuth>
          } 
        />
      </Route>
    </Routes>
  )
}
