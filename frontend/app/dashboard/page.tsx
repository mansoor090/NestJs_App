'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'
import { userAPI, houseAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'RESIDENT'
  createdAt: string
  updatedAt: string
}

interface House {
  id: string
  houseNo: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // User Dialog states
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // House Dialog states
  const [createHouseDialogOpen, setCreateHouseDialogOpen] = useState(false)
  const [editHouseDialogOpen, setEditHouseDialogOpen] = useState(false)
  const [deleteHouseDialogOpen, setDeleteHouseDialogOpen] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)

  // User Form states
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // House Form states
  const [houseFormData, setHouseFormData] = useState({
    houseNo: '',
    userId: '',
  })

  // Check if user is admin
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'ADMIN') {
        router.push('/')
      }
    }
  }, [authLoading, isAuthenticated, user, router])

  // Fetch data based on active tab
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      if (activeTab === 0) {
        fetchUsers()
      } else {
        fetchHouses()
        // Also fetch users for the dropdown in house forms
        fetchUsers()
      }
    }
  }, [isAuthenticated, user, activeTab])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await userAPI.getAll()
      setUsers(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchHouses = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await houseAPI.getAll()
      setHouses(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch houses')
    } finally {
      setLoading(false)
    }
  }

  // User handlers
  const handleCreateUserOpen = () => {
    setUserFormData({ name: '', email: '', password: '', confirmPassword: '' })
    setCreateUserDialogOpen(true)
  }

  const handleCreateUserClose = () => {
    setCreateUserDialogOpen(false)
    setUserFormData({ name: '', email: '', password: '', confirmPassword: '' })
  }

  const handleCreateUser = async () => {
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      setError('All fields are required')
      return
    }

    if (userFormData.password !== userFormData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (userFormData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      setError('')
      await userAPI.create({
        name: userFormData.name,
        email: userFormData.email,
        password: userFormData.password,
        role: 'RESIDENT',
      })
      setSuccess('User created successfully!')
      handleCreateUserClose()
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleEditUserOpen = (user: User) => {
    setSelectedUser(user)
    setUserFormData({ name: user.name, email: user.email, password: '', confirmPassword: '' })
    setEditUserDialogOpen(true)
  }

  const handleEditUserClose = () => {
    setEditUserDialogOpen(false)
    setSelectedUser(null)
    setUserFormData({ name: '', email: '', password: '', confirmPassword: '' })
  }

  const handleUpdateUser = async () => {
    if (!userFormData.name || !userFormData.email || !selectedUser) {
      setError('Name and email are required')
      return
    }

    try {
      setError('')
      await userAPI.update({
        name: userFormData.name,
        email: userFormData.email,
        originalEmail: selectedUser.email,
      })
      setSuccess('User updated successfully!')
      handleEditUserClose()
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeleteUserOpen = (user: User) => {
    setSelectedUser(user)
    setDeleteUserDialogOpen(true)
  }

  const handleDeleteUserClose = () => {
    setDeleteUserDialogOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setError('')
      await userAPI.delete(selectedUser.email)
      setSuccess('User deleted successfully!')
      handleDeleteUserClose()
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  // House handlers
  const handleCreateHouseOpen = async () => {
    // Ensure users are loaded for the dropdown
    if (users.length === 0) {
      await fetchUsers()
    }
    setHouseFormData({ houseNo: '', userId: '' })
    setCreateHouseDialogOpen(true)
  }

  const handleCreateHouseClose = () => {
    setCreateHouseDialogOpen(false)
    setHouseFormData({ houseNo: '', userId: '' })
  }

  const handleCreateHouse = async () => {
    if (!houseFormData.houseNo || !houseFormData.userId) {
      setError('All fields are required')
      return
    }

    try {
      setError('')
      await houseAPI.create({
        houseNo: houseFormData.houseNo,
        userId: houseFormData.userId,
      })
      setSuccess('House created successfully!')
      handleCreateHouseClose()
      fetchHouses()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create house')
    }
  }

  const handleEditHouseOpen = async (house: House) => {
    // Ensure users are loaded for the dropdown
    if (users.length === 0) {
      await fetchUsers()
    }
    setSelectedHouse(house)
    setHouseFormData({ houseNo: house.houseNo, userId: house.userId })
    setEditHouseDialogOpen(true)
  }

  const handleEditHouseClose = () => {
    setEditHouseDialogOpen(false)
    setSelectedHouse(null)
    setHouseFormData({ houseNo: '', userId: '' })
  }

  const handleUpdateHouse = async () => {
    if (!houseFormData.houseNo || !houseFormData.userId || !selectedHouse) {
      setError('All fields are required')
      return
    }

    try {
      setError('')
      await houseAPI.update({
        id: selectedHouse.id,
        houseNo: houseFormData.houseNo,
        userId: houseFormData.userId,
      })
      setSuccess('House updated successfully!')
      handleEditHouseClose()
      fetchHouses()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update house')
    }
  }

  const handleDeleteHouseOpen = (house: House) => {
    setSelectedHouse(house)
    setDeleteHouseDialogOpen(true)
  }

  const handleDeleteHouseClose = () => {
    setDeleteHouseDialogOpen(false)
    setSelectedHouse(null)
  }

  const handleDeleteHouse = async () => {
    if (!selectedHouse) return

    try {
      setError('')
      await houseAPI.delete(selectedHouse.id)
      setSuccess('House deleted successfully!')
      handleDeleteHouseClose()
      fetchHouses()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete house')
    }
  }

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Management Dashboard
          </Typography>
          {activeTab === 0 ? (
            <Button variant="contained" startIcon={<Add />} onClick={handleCreateUserOpen}>
              Add New User
            </Button>
          ) : (
            <Button variant="contained" startIcon={<Add />} onClick={handleCreateHouseOpen}>
              Add New House
            </Button>
          )}
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="User" />
            <Tab label="House" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* User Tab */}
        {activeTab === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'ADMIN' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditUserOpen(user)}
                        disabled={user.role === 'ADMIN'}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUserOpen(user)}
                        disabled={user.role === 'ADMIN'}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* House Tab */}
        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>House Number</TableCell>
                  <TableCell>Owner Name</TableCell>
                  <TableCell>Owner Email</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {houses.map((house) => (
                  <TableRow key={house.id}>
                    <TableCell>{house.houseNo}</TableCell>
                    <TableCell>{house.user.name}</TableCell>
                    <TableCell>{house.user.email}</TableCell>
                    <TableCell>{new Date(house.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditHouseOpen(house)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteHouseOpen(house)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create User Dialog */}
        <Dialog open={createUserDialogOpen} onClose={handleCreateUserClose} maxWidth="sm" fullWidth>
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Confirm Password"
              type="password"
              fullWidth
              variant="outlined"
              value={userFormData.confirmPassword}
              onChange={(e) => setUserFormData({ ...userFormData, confirmPassword: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateUserClose}>Cancel</Button>
            <Button onClick={handleCreateUser} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserDialogOpen} onClose={handleEditUserClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditUserClose}>Cancel</Button>
            <Button onClick={handleUpdateUser} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={deleteUserDialogOpen} onClose={handleDeleteUserClose}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteUserClose}>Cancel</Button>
            <Button onClick={handleDeleteUser} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create House Dialog */}
        <Dialog open={createHouseDialogOpen} onClose={handleCreateHouseClose} maxWidth="sm" fullWidth>
          <DialogTitle>Create New House</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="House Number"
              fullWidth
              variant="outlined"
              value={houseFormData.houseNo}
              onChange={(e) => setHouseFormData({ ...houseFormData, houseNo: e.target.value })}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Owner</InputLabel>
              <Select
                value={houseFormData.userId}
                label="Owner"
                onChange={(e) => setHouseFormData({ ...houseFormData, userId: e.target.value })}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateHouseClose}>Cancel</Button>
            <Button onClick={handleCreateHouse} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit House Dialog */}
        <Dialog open={editHouseDialogOpen} onClose={handleEditHouseClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit House</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="House Number"
              fullWidth
              variant="outlined"
              value={houseFormData.houseNo}
              onChange={(e) => setHouseFormData({ ...houseFormData, houseNo: e.target.value })}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Owner</InputLabel>
              <Select
                value={houseFormData.userId}
                label="Owner"
                onChange={(e) => setHouseFormData({ ...houseFormData, userId: e.target.value })}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditHouseClose}>Cancel</Button>
            <Button onClick={handleUpdateHouse} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete House Dialog */}
        <Dialog open={deleteHouseDialogOpen} onClose={handleDeleteHouseClose}>
          <DialogTitle>Delete House</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete house <strong>{selectedHouse?.houseNo}</strong>?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteHouseClose}>Cancel</Button>
            <Button onClick={handleDeleteHouse} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
