import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5269/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token from localStorage when present
api.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

// Handle 401 responses - clear auth and redirect to login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('authChanged'))
      
      // Only redirect if not already on login/register/home page
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        window.history.replaceState(null, '', '/login')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
export { api }
