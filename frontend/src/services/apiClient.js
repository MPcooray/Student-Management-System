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

export default api
export { api }
