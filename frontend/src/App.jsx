import React from 'react'
import RoutesApp from './routes'
import { ToastProvider } from './contexts/ToastContext'

export default function App(){
  return (
    <ToastProvider>
      <RoutesApp />
    </ToastProvider>
  )
}
