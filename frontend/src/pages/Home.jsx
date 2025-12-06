import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="home-image-bg fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80"></div>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 pt-20">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-2xl">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-xl">Welcome to Student Management</h1>
          <p className="text-xl mb-10 text-gray-100 drop-shadow-lg">Please log in or register to continue.</p>
          <div className="flex justify-center gap-6">
            <Link 
              to="/login" 
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-xl hover:bg-gray-50 transition-all hover:scale-105 hover:shadow-2xl flex items-center justify-center"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-2xl border-2 border-blue-500 flex items-center justify-center"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
