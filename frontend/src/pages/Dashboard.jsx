import React, { useEffect, useState } from 'react'
import { fetchStudents } from '../services/students'
import { fetchCourses } from '../services/courses'
import StatCard from '../components/StatCard'
import SectionCard from '../components/SectionCard'
import Skeleton from '../components/Skeleton'
import { UserGroupIcon, AcademicCapIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

export default function Dashboard(){
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ students: 0, courses: 0, enrollments: 0 })
  const [recentStudents, setRecentStudents] = useState([])
  const [topCourses, setTopCourses] = useState([])

  useEffect(()=>{
    let mounted = true

    async function load(){
      setLoading(true)
      try{
        const [studentsRes, coursesRes] = await Promise.all([
          fetchStudents({ pageSize: 1000 }),
          fetchCourses()
        ])

        if(!mounted) return

        const studentsArray = Array.isArray(studentsRes) ? studentsRes : (studentsRes.items ?? [])
        const studentsTotal = studentsRes?.total ?? studentsArray.length
        const coursesTotal = Array.isArray(coursesRes) ? coursesRes.length : 0
        // Build a map of courseId -> number of enrolled students from student.courseIds or enrollments
        const courseCounts = new Map()
        studentsArray.forEach(s => {
          const ids = Array.isArray(s.courseIds) ? s.courseIds : (Array.isArray(s.enrollments) ? s.enrollments.map(e => (e.course?.id ?? e.courseId)) : [])
          ids.forEach(cid => {
            const prev = courseCounts.get(cid) || 0
            courseCounts.set(cid, prev + 1)
          })
        })

        const enrollmentsTotal = Array.from(courseCounts.values()).reduce((a,b)=>a+b, 0)

        setStats({ students: studentsTotal, courses: coursesTotal, enrollments: enrollmentsTotal })

        setRecentStudents(studentsArray.slice(-6).reverse().map(s=>({ id: s.id, name: `${s.firstName} ${s.lastName}`, email: s.email, date: s.dateOfBirth || s.createdAt || null })))

        // Map courses to counts using the computed courseCounts so numbers stay accurate
        const top = (coursesRes || []).map(c => ({ id: c.id, name: c.name, code: c.code || `C${c.id}`, count: courseCounts.get(c.id) || 0 }))
        setTopCourses(top.sort((a,b)=>b.count-a.count).slice(0,6))
      }catch(err){
        // fallback mock data
        if(!mounted) return
        const mockStudents = [
          { id:1, firstName:'Ada', lastName:'Lovelace', email:'ada@example.com', date: '1997-12-10' },
          { id:2, firstName:'Alan', lastName:'Turing', email:'alan@example.com', date: '1996-06-23' },
          { id:3, firstName:'Grace', lastName:'Hopper', email:'grace@example.com', date: '1998-09-10' },
          { id:4, firstName:'Linus', lastName:'Torvalds', email:'linus@example.com', date: '1995-12-28' }
        ]
        const mockCourses = [
          { id:1, code:'CS101', name:'Intro to CS' },
          { id:2, code:'MATH201', name:'Calculus I' },
          { id:3, code:'ENG301', name:'Professional Writing' }
        ]
        // Distribute mock students across mock courses deterministically so counts are consistent
        const mockCourseCounts = new Map()
        mockCourses.forEach(c => mockCourseCounts.set(c.id, 0))
        mockStudents.forEach((s, idx) => {
          const cid = mockCourses[idx % mockCourses.length].id
          mockCourseCounts.set(cid, (mockCourseCounts.get(cid) || 0) + 1)
        })
        const mockEnrollmentsTotal = Array.from(mockCourseCounts.values()).reduce((a,b)=>a+b,0)

        setStats({ students: mockStudents.length, courses: mockCourses.length, enrollments: mockEnrollmentsTotal })
        setRecentStudents(mockStudents.map(s=>({ id: s.id, name: `${s.firstName} ${s.lastName}`, email: s.email, date: s.date })))
        setTopCourses(mockCourses.map(c=>({ id: c.id, name: c.name, code: c.code, count: mockCourseCounts.get(c.id) || 0 })))
      }finally{
        if(mounted) setLoading(false)
      }
    }

    load()
    return ()=> mounted = false
  },[])

  return (
    <div className="container">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Overview of students, courses and recent activity — clean, modern, and responsive.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="animate-fade-in">
              <div className="card p-4">
                <Skeleton height="h-8" width="w-20" />
                <div className="mt-4">
                  <Skeleton height="h-6" width="w-32" />
                  <div className="mt-2"><Skeleton height="h-3" width="w-40" /></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard icon={UserGroupIcon} title="Students" value={stats.students} change={Math.round((Math.random()-0.5)*10)} description="Total registered students" />
            <StatCard icon={AcademicCapIcon} title="Courses" value={stats.courses} change={Math.round((Math.random()-0.5)*10)} description="Active course offerings" />
            <StatCard icon={ClipboardDocumentListIcon} title="Enrollments" value={stats.enrollments} change={Math.round((Math.random()-0.5)*10)} description="Total course enrollments" />
          </>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recent Students">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i=> (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div>
                      <Skeleton height="h-4" width="w-36" />
                      <div className="mt-1"><Skeleton height="h-3" width="w-40" /></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">—</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentStudents.length === 0 && <div className="text-sm text-gray-500">No recent students</div>}
              {recentStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">{(s.name||'').split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.email}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{s.date ? new Date(s.date).toLocaleDateString() : '—'}</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Top Courses">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i=> (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <Skeleton height="h-4" width="w-40" />
                    <div className="mt-1"><Skeleton height="h-3" width="w-24" /></div>
                  </div>
                  <div className="text-sm text-gray-500">—</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topCourses.length === 0 && <div className="text-sm text-gray-500">No courses available</div>}
              {topCourses.map(c=> (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.code}</div>
                  </div>
                  <div className="text-sm text-gray-700">{c.count} students</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </section>
    </div>
  )
}
