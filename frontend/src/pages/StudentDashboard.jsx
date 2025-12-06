import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchStudent, enrollStudent, updateStudent } from '../services/students'
import { fetchCourses } from '../services/courses'
import { useToast } from '../contexts/ToastContext'

export default function StudentDashboard(){
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingEnrollments, setSavingEnrollments] = useState(false)
  const [form, setForm] = useState({ firstName:'', lastName:'', phone:'', address:'', dateOfBirth: '' })

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        const raw = localStorage.getItem('user')
        if (!raw) return
        const user = JSON.parse(raw)
        // Handle both Id and id property names
        const sid = user.id || user.Id
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
    if(!student || savingEnrollments) return
    setSavingEnrollments(true)
    try{
      await enrollStudent(student.id, Array.from(selected))
      success('Enrollments updated')
      // Reload after toast
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }catch(e){ 
      console.error(e)
      error('Failed to update enrollments')
      setSavingEnrollments(false)
    }
  }

  async function saveProfile(){
    if(!student || saving) return
    
    // Validate required fields
    if(!form.firstName || !form.firstName.trim()) {
      error('First name is required')
      return
    }
    if(!form.lastName || !form.lastName.trim()) {
      error('Last name is required')
      return
    }
    
    setSaving(true)
    try{
      // Prepare payload matching backend Student model
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: student.email, // Keep original email
        phone: form.phone?.trim() || null,
        address: form.address?.trim() || null,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth + 'T00:00:00').toISOString() : null,
        gender: student.gender || null,
        role: student.role || 'Student'
      }
      
      // Handle both id and Id property names
      const studentId = student.id || student.Id
      const res = await updateStudent(studentId, payload)
      // update local view and stored user name
      setStudent(prev => ({ ...prev, ...res }))
      const stored = JSON.parse(localStorage.getItem('user') || 'null')
      if(stored){ stored.firstName = res.firstName; stored.lastName = res.lastName; localStorage.setItem('user', JSON.stringify(stored)); window.dispatchEvent(new Event('authChanged')) }
      // Exit edit mode first
      setEditing(false)
      success('Profile saved')
      // Reload after toast
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }catch(e){ 
      console.error('Save error:', e)
      const errorMsg = e?.response?.data?.message || e?.response?.data || e?.message || 'Failed to save profile'
      error(errorMsg)
      setSaving(false)
    }
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
                <button onClick={saveProfile} className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
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
            <button onClick={saveEnrollments} className="btn-primary" disabled={savingEnrollments}>
              {savingEnrollments ? 'Saving...' : 'Save Enrollments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
