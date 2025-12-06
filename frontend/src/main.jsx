import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="bg-moving-gradient app-bg">
      <div className="bg-overlay">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </div>
    </div>
  </StrictMode>
)
