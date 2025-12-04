import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStudents, deleteStudent } from '../services/students'

export default function StudentsList(){
  const [students, setStudents] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(()=>{
    load()
  },[page])

  async function load(){
    try{
      const data = await fetchStudents({ page, pageSize: 10 })
      setStudents(data.items || data)
      setTotal(data.total || (data.items ? data.total : data.length))
    }catch(err){ console.error(err) }
  }

  async function handleDelete(id){
    if(!confirm('Delete this student?')) return
    await deleteStudent(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Students</h2>
        <Link to="/students/new" className="btn">New Student</Link>
      </div>
      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Courses</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t">
                <td className="py-2">{s.id}</td>
                <td className="py-2">{s.firstName} {s.lastName}</td>
                <td className="py-2">{s.email}</td>
                <td className="py-2">{s.courseIds ? s.courseIds.length : 0}</td>
                <td className="py-2 text-right">
                  <Link to={`/students/${s.id}`} className="text-primary mr-2">View</Link>
                  <button onClick={()=> handleDelete(s.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button onClick={()=> setPage(p=> Math.max(1, p-1))} className="mr-2 btn">Prev</button>
        <button onClick={()=> setPage(p=> p+1)} className="btn">Next</button>
      </div>
    </div>
  )
}
