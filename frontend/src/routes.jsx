import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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
        <Route path="students" element={<StudentsList />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="student-dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<CoursesPage />} />
      </Route>
    </Routes>
  )
}
