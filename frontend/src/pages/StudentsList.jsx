import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStudents, deleteStudent } from '../services/students'
import { TrashIcon, EyeIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'

function Avatar({ name }){
  const initials = (name||'').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">{initials}</div>
  )
}

export default function StudentsList(){
  const [students, setStudents] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ load() },[page])

  async function load(){
    setLoading(true)
    try{
      const data = await fetchStudents({ page, pageSize: 10, search: query })
      const items = data.items || data
      setStudents(items)
      setTotal(data.total ?? (Array.isArray(items) ? items.length : 0))
    }catch(err){ console.error(err) }
    finally{ setLoading(false) }
  }

  async function handleDelete(id){
    if(!confirm('Delete this student?')) return
    try{
      await deleteStudent(id)
      await load()
    }catch(err){
      console.error(err)
      alert('Failed to delete student')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <p className="text-sm text-gray-600">Manage registered students and view their enrollments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/students/new" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md shadow"> <PlusIcon className="w-4 h-4"/> New Student</Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input value={query} onChange={e=> setQuery(e.target.value)} placeholder="Search students by name or email" className="w-full border rounded-md px-3 py-2" />
            <button onClick={()=> { setPage(1); load(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"><MagnifyingGlassIcon className="w-5 h-5"/></button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="w-12">ID</th>
              <th>Name</th>
              <th>Email</th>
              <th className="text-center">Courses</th>
              <th className="w-36"></th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t">
                <td className="py-3">{s.id}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${s.firstName} ${s.lastName}`} />
                    <div>
                      <div className="font-medium text-gray-800">{s.firstName} {s.lastName}</div>
                      {(() => {
                        const dob = s.dateOfBirth ? new Date(s.dateOfBirth) : null
                        const created = s.createdAt ? new Date(s.createdAt) : null
                        const joinedDate = (created && !isNaN(created.getTime()) && created.getFullYear() > 1900) ? created : new Date()
                        const dobValid = dob && !isNaN(dob.getTime())
                        let age = '—'
                        if (dobValid) {
                          const today = new Date()
                          age = today.getFullYear() - dob.getFullYear()
                          const m = today.getMonth() - dob.getMonth()
                          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1
                        }
                        return (
                          <div className="text-xs text-gray-500">Joined: {joinedDate.toLocaleDateString()} · Age: {age}</div>
                        )
                      })()}
                    </div>
                  </div>
                </td>
                <td className="py-3">{s.email}</td>
                <td className="py-3 text-center">{s.courseIds ? s.courseIds.length : (s.enrollments ? s.enrollments.length : 0)}</td>
                <td className="py-3 text-right">
                  <Link to={`/students/${s.id}`} className="inline-flex items-center gap-2 text-primary mr-3"><EyeIcon className="w-4 h-4"/>View</Link>
                  <button onClick={()=> handleDelete(s.id)} className="inline-flex items-center gap-2 text-red-600"><TrashIcon className="w-4 h-4"/>Delete</button>
                </td>
              </tr>
            ))}
            {students.length === 0 && !loading && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-500">No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Showing {students.length} of {total} students</div>
        <div className="flex items-center gap-2">
          <button onClick={()=> setPage(p=> Math.max(1, p-1))} className="btn">Prev</button>
          <button onClick={()=> setPage(p=> p+1)} className="btn">Next</button>
        </div>
      </div>
    </div>
  )
}
