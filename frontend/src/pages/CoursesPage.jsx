import React, { useEffect, useState } from 'react'
import { fetchCourses, createCourse, deleteCourse } from '../services/courses'
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useToast } from '../contexts/ToastContext'

export default function CoursesPage(){
  const { success, error, warning } = useToast()
  const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const currentUser = rawUser ? JSON.parse(rawUser) : null
  const isAdmin = currentUser?.role === 'Admin'
  const [courses, setCourses] = useState([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [credits, setCredits] = useState(3)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState({})

  useEffect(()=>{ load() },[])
  async function load(){
    setLoading(true)
    try{ setCourses(await fetchCourses() || []) }catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }

  async function add(){
    if(!name || !code) {
      warning('Please provide name and code')
      return
    }
    if(!isAdmin) {
      error('Only admins can create courses')
      return
    }
    setCreating(true)
    try{
      await createCourse({ name, code, credits })
      setName(''); setCode(''); setCredits(3)
      success('Course created successfully')
      await load()
    }catch(err){ 
      console.error(err)
      error('Failed to create course: ' + (err?.response?.data?.message || err?.response?.data || err.message))
    } finally {
      setCreating(false)
    }
  }

  async function remove(id){
    if(!window.confirm('Delete course?')) return
    setDeleting(prev => ({ ...prev, [id]: true }))
    try{
      await deleteCourse(id)
      success('Course deleted successfully')
      await load()
    }catch(err){ 
      console.error(err)
      error('Failed to delete course')
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
          <p className="text-sm text-gray-600">Create and manage course offerings.</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input aria-label="Course name" value={name} onChange={e=> setName(e.target.value)} placeholder="Name" className="border rounded-md px-3 py-2" />
          <input aria-label="Course code" value={code} onChange={e=> setCode(e.target.value)} placeholder="Code" className="border rounded-md px-3 py-2" />
          <input aria-label="Credits" type="number" value={credits} onChange={e=> setCredits(Number(e.target.value))} className="border rounded-md px-3 py-2" />
        </div>
        <div className="mt-3">
          <button onClick={add} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md shadow" disabled={creating}>
            <PlusIcon className="w-4 h-4"/> {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="w-12">ID</th>
              <th>Name</th>
              <th>Code</th>
              <th className="w-24">Credits</th>
              <th className="w-28"></th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c=> (
              <tr key={c.id} className="border-t">
                <td className="py-3">{c.id}</td>
                <td className="py-3 font-medium text-gray-800">{c.name}</td>
                <td className="py-3 text-xs text-gray-500">{c.code}</td>
                <td className="py-3">{c.credits ?? 3}</td>
                <td className="py-3 text-right">
                  {isAdmin ? (
                    <button onClick={()=> remove(c.id)} className="inline-flex items-center gap-2 text-red-600" disabled={deleting[c.id]}>
                      <TrashIcon className="w-4 h-4"/>{deleting[c.id] ? 'Deleting...' : 'Delete'}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Admin only</span>
                  )}
                </td>
              </tr>
            ))}
            {courses.length === 0 && !loading && (<tr><td colSpan={5} className="py-6 text-center text-gray-500">No courses yet</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
