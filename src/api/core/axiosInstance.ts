import axios from 'axios'

/**
 * Singleton Axios instance.
 * Configure base URL, timeouts, and default headers here.
 * Auth headers and interceptors should be registered here too.
 */
const axiosInstance = axios.create({
  baseURL:        import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout:        10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
})

// Request interceptor — attach auth token when present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — centralized error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Future: redirect to login or refresh token
      console.warn('[API] Unauthorized — token may have expired')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
