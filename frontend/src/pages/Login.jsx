import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login } from '../services/auth'

export default function Login(){
  const { register: r, handleSubmit } = useForm()
  const navigate = useNavigate()

  async function onSubmit(data){
    try{
      const res = await login({ email: data.email, password: data.password })
      // store basic user info if present
      if (res?.user) localStorage.setItem('user', JSON.stringify(res.user))
      // redirect based on role
      const role = res?.user?.role || ''
      if (role === 'Admin') navigate('/dashboard')
      else navigate('/student-dashboard')
    }catch(err){
      alert('Login failed: ' + (err?.response?.data || err.message))
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
        <p className="muted mb-4">Sign in to access your student dashboard</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input {...r('email', { required: true })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input {...r('password', { required: true })} type="password" className="input" />
          </div>
          <div>
            <button type="submit" className="btn-primary w-full">Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}
