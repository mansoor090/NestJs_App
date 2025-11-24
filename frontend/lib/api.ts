import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Add response interceptor to handle 
  // refresh token
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )


  
// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password })
      if (response.data.jwt) {
        localStorage.setItem('token', response.data.jwt)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
      return response.data
    },
    status: async () => {
      const response = await api.get('/auth/status')
      return response.data
    },
  }
  
  
  
// User API (Admin only)
export const userAPI = {
    getAll: async () => {
      const response = await api.get('/admin/users/all')
      return response.data
    },
    create: async (data: { name: string; email: string; password: string; role?: string }) => {
      const response = await api.post('/admin/users/create', data)
      return response.data
    },
    update: async (data: { name: string; email: string; originalEmail: string }) => {
      const response = await api.put('/admin/users/update', data)
      return response.data
    },
    delete: async (email: string) => {
      const response = await api.delete('/admin/users/delete', {
        data: { email },
      })
      return response.data
    },
  }

// House API (Admin only)
export const houseAPI = {
    getAll: async () => {
      const response = await api.get('/admin/houses/all')
      return response.data
    },
    create: async (data: { houseNo: string; userId: string }) => {
      const response = await api.post('/admin/houses/create', data)
      return response.data
    },
    update: async (data: { id: string; houseNo: string; userId: string }) => {
      const response = await api.put('/admin/houses/update', data)
      return response.data
    },
    delete: async (id: string) => {
      const response = await api.delete('/admin/houses/delete', {
        data: { id },
      })
      return response.data
    },
  }

// Invoice API (Resident only)
export const invoiceAPI = {
    getUserInvoices: async () => {
      const response = await api.get('/user/invoices')
      return response.data
    },
    getInvoiceById: async (id: string) => {
      const response = await api.get(`/user/invoices/${id}`)
      return response.data
    },
  }

// User Houses API (Resident only)
export const userHousesAPI = {
    getUserHouses: async () => {
      const response = await api.get('/user/houses')
      return response.data
    },
  }