'use client'

import { useAuth } from '@/hooks/useAuth'
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }

  const handleLogoutClick = () => {
    logout()
    router.push('/')
  }

  const handleLoginClick = () => {
    router.push('/login')
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Test Company
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Button
              color="inherit"
              onClick={handleDashboardClick}
            >
              Dashboard
            </Button>
          )}
          {isAuthenticated ? (
            <Button
              color="inherit"
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={handleLoginClick}
            >
              Login
            </Button>
          )}
          
        </Box>

      </Toolbar>
    </AppBar>
  )
}