import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createStudent, enrollStudent } from '../services/students'
import CourseSelect from '../components/CourseSelect'
import { useNavigate } from 'react-router-dom'

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine(val => {
    const d = new Date(val)
    if (isNaN(d.getTime())) return false
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const m = today.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1
    return age >= 17
  }, { message: 'Student must be at least 17 years old' }),
  gender: z.string().optional(),
  phone: z.string().optional().refine(v => {
    if (!v) return true
    return /^\d{10}$/.test(v)
  }, { message: 'Phone number must be exactly 10 digits' }),
  address: z.string().optional(),
  courseIds: z.array(z.number()).min(1, 'Please select at least one course')
})

export default function StudentForm(){
  const navigate = useNavigate()
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '', phone: '', address: '', courseIds: [] }
  })

  // compute an input max date so the user cannot pick a DOB that makes them younger than 17
  const maxDob = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 17)
    return d.toISOString().slice(0,10)
  })()

  const onSubmit = async (data) => {
    try {
      const student = await createStudent(data)
      // enroll in selected courses if any
      if (data.courseIds && Array.isArray(data.courseIds) && data.courseIds.length > 0) {
        await enrollStudent(student.id, data.courseIds)
      }
      navigate('/students')
    } catch (err) {
      console.error(err)
      alert('Failed to create student')
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Register Student</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm">First name</label>
          <input {...register('firstName')} className="w-full border rounded px-3 py-2" />
          {errors.firstName && <div className="text-sm text-red-600">{errors.firstName.message}</div>}
        </div>
        <div>
          <label className="block text-sm">Last name</label>
          <input {...register('lastName')} className="w-full border rounded px-3 py-2" />
          {errors.lastName && <div className="text-sm text-red-600">{errors.lastName.message}</div>}
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input type="email" {...register('email')} className="w-full border rounded px-3 py-2" />
          {errors.email && <div className="text-sm text-red-600">{errors.email.message}</div>}
        </div>
        
        <div>
          <label className="block text-sm">Gender</label>
          <select {...register('gender')} className="w-full border rounded px-3 py-2">
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input {...register('phone')} placeholder="10 digits" className="w-full border rounded px-3 py-2" />
          {errors.phone && <div className="text-sm text-red-600">{errors.phone.message}</div>}
        </div>
        <div>
          <label className="block text-sm">Address</label>
          <textarea {...register('address')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Date of birth</label>
          <input type="date" {...register('dateOfBirth')} max={maxDob} className="w-full border rounded px-3 py-2" />
          {errors.dateOfBirth && <div className="text-sm text-red-600">{errors.dateOfBirth.message}</div>}
        </div>
        <div>
          <label className="block text-sm">Courses</label>
          <Controller
            control={control}
            name="courseIds"
            render={({ field }) => (
              <CourseSelect
                value={field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
          {errors.courseIds && <div className="text-sm text-red-600">{errors.courseIds.message}</div>}
        </div>
        <div>
          <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Register'}</button>
        </div>
      </form>
    </div>
  )
}
