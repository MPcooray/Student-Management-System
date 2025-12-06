import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login, getCurrentUser } from '../services/auth'
import { useToast } from '../contexts/ToastContext'

export default function Login(){
  const { register: r, handleSubmit, formState: { isSubmitting } } = useForm()
  const navigate = useNavigate()
  const { success, error } = useToast()

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = getCurrentUser()
    if (token && user) {
      const role = user.role || ''
      if (role === 'Admin') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/student-dashboard', { replace: true })
      }
    }
  }, [navigate])

  async function onSubmit(data){
    try{
      const res = await login({ email: data.email, password: data.password })
      // store basic user info if present, normalize Id to id
      if (res?.user) {
        const user = { ...res.user, id: res.user.id || res.user.Id }
        localStorage.setItem('user', JSON.stringify(user))
      }
      success('Login successful!')
      // redirect based on role
      const role = res?.user?.role || ''
      setTimeout(() => {
        if (role === 'Admin') navigate('/dashboard')
        else navigate('/student-dashboard')
      }, 500)
    }catch(err){
      error('Login failed: ' + (err?.response?.data?.message || err?.response?.data || err.message))
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
            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
