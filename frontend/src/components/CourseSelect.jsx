import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { fetchCourses } from '../services/courses'

export default function CourseSelect({ value, onChange, isMulti = true }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchCourses()
      .then(data => {
        if (!mounted) return
        const opts = data.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }))
        setOptions(opts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => (mounted = false)
  }, [])

  return (
    <Select
      isMulti={isMulti}
      options={options}
      value={options.filter(o => (Array.isArray(value) ? value.includes(o.value) : o.value === value))}
      onChange={selected => {
        if (isMulti) onChange(selected ? selected.map(s => s.value) : [])
        else onChange(selected ? selected.value : null)
      }}
      isLoading={loading}
      placeholder="Select courses..."
      classNamePrefix="react-select"
    />
  )
}
