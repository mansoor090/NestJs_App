'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material'
import { ExpandMore, Visibility } from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'
import { invoiceAPI, userHousesAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { loadStripe } from '@stripe/stripe-js';

interface Invoice {
  id: string
  houseId: string
  createdAt: string
  updatedAt: string
  house: {
    id: string
    houseNo: string
  }
  items: {
    id: string
    productType: 'MONTHLY_BILL' | 'LATE_SURCHARGE'
    amount: number
    createdAt: string
  }[]
  transaction: {
    id: string
    status: 'PENDING' | 'COMPLETED' | 'FAILED'
    amount: number
    completedAt: string | null
  } | null
}

interface House {
  id: string
  houseNo: string
  createdAt: string
  updatedAt: string
}

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Check if user is resident
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role === 'ADMIN') {
        router.push('/dashboard')
      }
    }
  }, [authLoading, isAuthenticated, user, router])

  // Fetch data based on active tab
  useEffect(() => {
    if (isAuthenticated && user?.role === 'RESIDENT') {
      if (activeTab === 0) {
        fetchInvoices()
      } else if (activeTab === 1) {
        fetchHouses()
      }
    }
  }, [isAuthenticated, user, activeTab])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await invoiceAPI.getUserInvoices()
      setInvoices(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const fetchHouses = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await userHousesAPI.getUserHouses()
      setHouses(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch houses')
    } finally {
      setLoading(false)
    }
  }

  const calculateInvoiceTotal = (invoice: Invoice): number => {
    return invoice.items.reduce((sum, item) => sum + item.amount, 0)
  }

  // Add state for loading
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);


  const handlePayment = async (invoice: Invoice) => {
    try {
      setProcessingPayment(invoice.id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      const data = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      setError('Failed to initiate payment');
      setProcessingPayment(null);
    }
  };


  const getPaymentStatus = (invoice: Invoice): { label: string; color: 'success' | 'warning' | 'error' } => {
    if (invoice.transaction?.status === 'COMPLETED') {
      return { label: 'Paid', color: 'success' }
    }
    if (invoice.transaction?.status === 'PENDING') {
      return { label: 'Pending', color: 'warning' }
    }
    if (invoice.transaction?.status === 'FAILED') {
      return { label: 'Failed', color: 'error' }
    }
    return { label: 'Unpaid', color: 'error' }
  }

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated || user?.role !== 'RESIDENT') {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          My Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Invoice" />
            <Tab label="House" />
            <Tab label="Profile" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Invoice Tab */}
        {activeTab === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice Date</TableCell>
                  <TableCell>House Number</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Pay Button</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => {
                    const total = calculateInvoiceTotal(invoice)
                    const paymentStatus = getPaymentStatus(invoice)
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.house.houseNo}</TableCell>
                        <TableCell>${total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label={paymentStatus.label} color={paymentStatus.color} size="small" />
                        </TableCell>

                        <TableCell>
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography variant="body2">
                                {invoice.items.length} item(s)
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box>
                                {invoice.items.map((item) => (
                                  <Box
                                    key={item.id}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      mb: 1,
                                      p: 1,
                                      bgcolor: 'grey.100',
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Typography variant="body2">
                                      {item.productType === 'MONTHLY_BILL' ? 'Monthly Bill' : 'Late Surcharge'}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      ${item.amount.toFixed(2)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        </TableCell>
                        <TableCell>
                          {invoice.transaction?.status !== 'COMPLETED' && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handlePayment(invoice)}
                              disabled={processingPayment === invoice.id}
                            >
                              {processingPayment === invoice.id ? 'Processing...' : 'Pay Now'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* House Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {houses.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">No houses found</Alert>
              </Grid>
            ) : (
              houses.map((house) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={house.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        House #{house.houseNo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(house.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* Profile Tab */}
        {activeTab === 2 && user && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profile Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip
                      label={user.role}
                      color={user.role === 'ADMIN' ? 'primary' : 'default'}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}

