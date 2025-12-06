import api from './apiClient'

export async function register(payload){
  const res = await api.post('/auth/register', payload)
  return res.data
}

export async function login({ email, password }){
  const res = await api.post('/auth/login', { email, password })
  const data = res.data
  if (data?.token) {
    try {
      localStorage.setItem('token', data.token)
      // also persist user info for UI and emit an event so other components update
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
      try { window.dispatchEvent(new Event('authChanged')) } catch(e){}
    } catch(e){}
  }
  return data
}

export function logout(){
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    try { window.dispatchEvent(new Event('authChanged')) } catch(e){}
  } catch(e) {}
}

export function getCurrentUser(){
  try {
    const raw = localStorage.getItem('token')
    if (!raw) return null
    // optionally decode to get user info; we store minimal user info on login response
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch(e){ return null }
}
