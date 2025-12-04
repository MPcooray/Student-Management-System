import React, { useEffect, useState } from 'react'
import { fetchStudents } from '../services/students'
import { fetchCourses } from '../services/courses'

export default function Dashboard(){
  const [stats, setStats] = useState({ students: 0, courses: 0, enrollments: 0 })

  useEffect(()=>{
    let mounted = true
    // fetch students and courses, then compute enrollments count from student.enrollments
    Promise.all([fetchStudents({ pageSize: 1000 }), fetchCourses()])
      .then(([studentsRes, courses])=>{
        if(!mounted) return
        const studentsArray = Array.isArray(studentsRes) ? studentsRes : (studentsRes.items ?? [])
        const studentsTotal = studentsRes?.total ?? studentsArray.length
        const coursesTotal = courses?.length ?? 0
        const enrollmentsTotal = studentsArray.reduce((acc, s) => {
          const count = Array.isArray(s.courseIds) ? s.courseIds.length : (Array.isArray(s.enrollments) ? s.enrollments.length : 0)
          return acc + count
        }, 0)
        setStats({ students: studentsTotal, courses: coursesTotal, enrollments: enrollmentsTotal })
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
