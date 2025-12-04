import React, { useEffect, useState } from 'react'
import { fetchStudents } from '../services/students'
import { fetchCourses } from '../services/courses'

export default function Dashboard(){
  const [stats, setStats] = useState({ students: 0, courses: 0, enrollments: 0 })

  useEffect(()=>{
    let mounted = true
    Promise.all([fetchStudents({ pageSize: 1 }), fetchCourses()])
      .then(([studentsRes, courses])=>{
        if(!mounted) return
        const studentsTotal = studentsRes?.total ?? (Array.isArray(studentsRes) ? studentsRes.length : 0)
        const coursesTotal = courses?.length ?? 0
        // enrollments not provided by backend in this mock; approximate
        setStats({ students: studentsTotal, courses: coursesTotal, enrollments: 0 })
      })
    return ()=> mounted = false
  },[])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card">
        <div className="text-sm muted">Students</div>
        <div className="text-2xl font-semibold">{stats.students}</div>
      </div>
      <div className="card">
        <div className="text-sm muted">Courses</div>
        <div className="text-2xl font-semibold">{stats.courses}</div>
      </div>
      <div className="card">
        <div className="text-sm muted">Enrollments</div>
        <div className="text-2xl font-semibold">{stats.enrollments}</div>
      </div>
    </div>
  )
}
