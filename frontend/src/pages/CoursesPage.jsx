import React, { useEffect, useState } from 'react'
import { fetchCourses, createCourse, deleteCourse } from '../services/courses'

export default function CoursesPage(){
  const [courses, setCourses] = useState([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [credits, setCredits] = useState(3)

  useEffect(()=>{ load() },[])
  async function load(){
    setCourses(await fetchCourses())
  }

  async function add(){
    const c = await createCourse({ name, code, credits })
    setName(''); setCode(''); setCredits(3)
    load()
  }

  async function remove(id){
    if(!confirm('Delete course?')) return
    try{
      await deleteCourse(id)
      alert('Deleted')
      load()
    }catch(err){
      console.error(err)
      alert('Failed to delete course')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Courses</h2>
      </div>
      <div className="card mb-4">
        <div className="grid grid-cols-3 gap-2">
          <input value={name} onChange={e=> setName(e.target.value)} placeholder="Name" className="border rounded px-2 py-1" />
          <input value={code} onChange={e=> setCode(e.target.value)} placeholder="Code" className="border rounded px-2 py-1" />
          <input type="number" value={credits} onChange={e=> setCredits(Number(e.target.value))} className="border rounded px-2 py-1" />
        </div>
        <div className="mt-2">
          <button onClick={add} className="btn">Create</button>
        </div>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-600"><th>ID</th><th>Name</th><th>Code</th><th>Credits</th><th></th></tr></thead>
          <tbody>
            {courses.map(c=> (
              <tr key={c.id} className="border-t"><td className="py-2">{c.id}</td><td>{c.name}</td><td>{c.code}</td><td>{c.credits}</td><td className="text-right"><button onClick={()=> remove(c.id)} className="text-red-600">Delete</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
