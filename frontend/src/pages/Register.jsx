import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { register as registerUser, login, getCurrentUser } from '../services/auth'
import { useToast } from '../contexts/ToastContext'

export default function Register(){
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
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        address: data.address
      })
      // attempt login automatically
      const res = await login({ email: data.email, password: data.password })
      if (res?.user) localStorage.setItem('user', JSON.stringify(res.user))
      success('Registration successful!')
      setTimeout(() => {
        navigate('/')
      }, 500)
    }catch(err){
      const errorMsg = err?.response?.data?.message || err?.response?.data || err.message
      error('Registration failed: ' + errorMsg)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">Create an account</h2>
        <p className="muted mb-4">Register as a student to enroll in courses</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">First name</label>
              <input {...r('firstName')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium">Last name</label>
              <input {...r('lastName')} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input {...r('email', { required: true })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input {...r('password', { required: true })} type="password" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input {...r('phone')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium">Date of birth</label>
            <input {...r('dateOfBirth')} type="date" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input {...r('address')} className="input" />
          </div>
          <div>
            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
