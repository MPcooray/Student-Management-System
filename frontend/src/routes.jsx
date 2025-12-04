import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StudentsList from './pages/StudentsList'
import StudentForm from './pages/StudentForm'
import StudentDetail from './pages/StudentDetail'
import CoursesPage from './pages/CoursesPage'

export default function RoutesApp(){
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<StudentsList />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="courses" element={<CoursesPage />} />
      </Route>
    </Routes>
  )
}
