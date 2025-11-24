'use client'

import { useState, useEffect } from 'react'
import { authAPI } from '@/lib/api'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const userData = await authAPI.status()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    // Note: Router redirect should be handled in the component calling logout
  }

  return { user, loading, isAuthenticated: !!user, logout, checkAuth }
}