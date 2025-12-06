import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Student Management</h1>
      <p className="mb-8 text-gray-600">Please log in or register to continue.</p>
      <div className="flex justify-center gap-4">
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Login</Link>
        <Link to="/register" className="px-4 py-2 border border-blue-600 text-blue-600 rounded">Register</Link>
      </div>
    </div>
  )
}
