import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchStudent, enrollStudent, updateStudent } from '../services/students'
import { fetchCourses } from '../services/courses'

export default function StudentDashboard(){
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName:'', lastName:'', phone:'', address:'', dateOfBirth: '' })

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        const raw = localStorage.getItem('user')
        if (!raw) return
        const user = JSON.parse(raw)
        const sid = user.id
        const [s, cs] = await Promise.all([fetchStudent(sid), fetchCourses()])
        if(!mounted) return
        setStudent(s)
        setCourses(cs || [])
        setSelected(new Set(s.courseIds || []))
        setForm({ firstName: s.firstName || '', lastName: s.lastName || '', phone: s.phone || '', address: s.address || '', dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().slice(0,10) : '' })
      }catch(e){ console.error(e) }
      finally{ if(mounted) setLoading(false) }
    }
    load()
    return ()=> mounted = false
  },[])

  function toggleCourse(id){
    const next = new Set(selected)
    if(next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function saveEnrollments(){
    if(!student) return
    try{
      await enrollStudent(student.id, Array.from(selected))
      alert('Enrollments updated')
      // Reload after alert is dismissed
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }catch(e){ console.error(e); alert('Failed to update enrollments') }
  }

  async function saveProfile(){
    if(!student) return
    try{
      const payload = { ...form }
      if(payload.dateOfBirth === '') payload.dateOfBirth = null
      const res = await updateStudent(student.id, payload)
      // update local view and stored user name
      setStudent(prev => ({ ...prev, ...res }))
      const stored = JSON.parse(localStorage.getItem('user') || 'null')
      if(stored){ stored.firstName = res.firstName; stored.lastName = res.lastName; localStorage.setItem('user', JSON.stringify(stored)); window.dispatchEvent(new Event('authChanged')) }
      // Exit edit mode first
      setEditing(false)
      // Show alert and reload after OK is clicked
      alert('Profile saved')
      // Reload after alert is dismissed
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }catch(e){ console.error(e); alert('Failed to save profile') }
  }

  if(loading) return <div className="p-6">Loading...</div>
  if(!student) return <div className="p-6">No user found. Please login.</div>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and enrollments</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card col-span-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Profile</h2>
            <button onClick={()=> setEditing(e => !e)} className="text-sm text-blue-600">{editing ? 'Cancel' : 'Edit'}</button>
          </div>

          {!editing ? (
            <div className="space-y-2 text-sm text-gray-700">
              <div><strong>Name:</strong> {student.firstName} {student.lastName}</div>
              <div><strong>Email:</strong> {student.email}</div>
              <div><strong>Phone:</strong> {student.phone || '—'}</div>
              <div><strong>DOB:</strong> {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}</div>
              <div><strong>Address:</strong> {student.address || '—'}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">First name</label>
                <input value={form.firstName} onChange={e=> setForm(f=> ({...f, firstName: e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Last name</label>
                <input value={form.lastName} onChange={e=> setForm(f=> ({...f, lastName: e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Phone</label>
                <input value={form.phone} onChange={e=> setForm(f=> ({...f, phone: e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Date of birth</label>
                <input type="date" value={form.dateOfBirth} onChange={e=> setForm(f=> ({...f, dateOfBirth: e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Address</label>
                <input value={form.address} onChange={e=> setForm(f=> ({...f, address: e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end">
                <button onClick={saveProfile} className="btn-primary">Save</button>
              </div>
            </div>
          )}
        </div>

        <div className="card col-span-2 p-6">
          <h2 className="text-lg font-semibold mb-4">Enroll in Courses</h2>
          {courses.length === 0 && <div className="text-sm text-gray-500">No courses available</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(c=> (
              <label key={c.id} className="flex items-start gap-3 p-3 border rounded">
                <input className="mt-1" type="checkbox" checked={selected.has(c.id)} onChange={()=> toggleCourse(c.id)} />
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.code} · {c.credits ?? 3} credits</div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4">
            <button onClick={saveEnrollments} className="btn-primary">Save Enrollments</button>
          </div>
        </div>
      </div>
    </div>
  )
}
