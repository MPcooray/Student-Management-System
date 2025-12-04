import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StudentForm from '../pages/StudentForm'
import { BrowserRouter } from 'react-router-dom'

test('shows validation errors when required fields empty', async () => {
  render(<BrowserRouter><StudentForm /></BrowserRouter>)
  const btn = screen.getByRole('button', { name: /register/i })
  fireEvent.click(btn)
  await waitFor(() => {
    expect(screen.getByText(/First name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Last name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Invalid email|email/i)).toBeInTheDocument()
  })
})
