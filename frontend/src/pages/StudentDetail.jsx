import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchStudent, enrollStudent, deleteStudent } from '../services/students'
import CourseSelect from '../components/CourseSelect'

export default function StudentDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)

  useEffect(()=>{ load() },[id])
  async function load(){
    const data = await fetchStudent(id)
    setStudent(data)
  }

  async function handleSave(){
    // very small inline edit example: just reassign courses
    try{
      await enrollStudent(id, student.courseIds || [])
      alert('Saved')
      navigate('/students')
    }catch(e){ console.error(e); alert('Failed') }
  }

  async function handleDelete(){
    if(!confirm('Delete student?')) return
    await deleteStudent(id)
    navigate('/students')
  }

  if(!student) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{student.firstName} {student.lastName}</h2>
      <div className="card mb-4">
        <div className="mb-2"><strong>Email:</strong> {student.email}</div>
        {student.dateOfBirth ? (() => {
          const dob = new Date(student.dateOfBirth)
          const today = new Date()
          let age = '—'
          if (!isNaN(dob.getTime())){
            age = today.getFullYear() - dob.getFullYear()
            const m = today.getMonth() - dob.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1
          }
          return (
            <>
              <div className="mb-2"><strong>DOB:</strong> {isNaN(dob.getTime()) ? student.dateOfBirth : dob.toLocaleDateString()}</div>
              <div className="mb-2"><strong>Age:</strong> {age}</div>
            </>
          )
        })() : <div className="mb-2"><strong>DOB:</strong> —</div>}
        <div className="mb-2"><strong>Phone:</strong> {student.phone}</div>
        <div className="mb-2"><strong>Address:</strong> {student.address}</div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Enrollments</h3>
        <CourseSelect value={student.courseIds || []} onChange={(v)=> setStudent(s => ({...s, courseIds: v}))} />
        <div className="mt-3">
          <button onClick={handleSave} className="btn mr-2">Save</button>
          <button onClick={handleDelete} className="text-red-600">Delete</button>
        </div>
      </div>
    </div>
  )
}
