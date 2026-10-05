import axios from 'axios'

// In production (Vercel), VITE_API_URL points to the Render backend.
// In dev, it's empty so the Vite proxy handles /api -> localhost:5000.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('raktsetu_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('raktsetu_token')
      localStorage.removeItem('raktsetu_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ---- Auth ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ---- Donors ----
export const donorAPI = {
  getAll: () => api.get('/donors'),
  getMyProfile: () => api.get('/donors/me'),
  saveProfile: (data) => api.post('/donors/me', data),
  toggleAvailability: (availability) => api.patch('/donors/me/availability', { availability }),
}

// ---- Blood Requests ----
export const requestAPI = {
  create: (data) => api.post('/requests', data),
  getAll: () => api.get('/requests'),
  getById: (id) => api.get(`/requests/${id}`),
  getMatches: (id) => api.get(`/requests/${id}/matches`),
  cancel: (id) => api.delete(`/requests/${id}`),
  fulfill: (id) => api.patch(`/requests/${id}/fulfill`),
}

// ---- Matches ----
export const matchAPI = {
  respond: (matchId, action) => api.post(`/matches/${matchId}/respond`, { action }),
  getMyMatches: () => api.get('/matches/donor/me'),
  sendToDonor: (requestId, donorId) => api.post(`/matches/send/${requestId}/${donorId}`),
}

// ---- Admin ----
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getRequests: () => api.get('/admin/requests'),
  getDonors: () => api.get('/admin/donors'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
}

export default api
