'use client'

import { useState, useEffect, useMemo } from 'react'
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  Stack,
  Pagination,
} from '@mui/material'
import { ExpandMore, FilterList, Clear } from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'
import { invoiceAPI, userHousesAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'

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
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0) // Total count from server

  // Filter states
  const [selectedHouseNo, setSelectedHouseNo] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<{
    MONTHLY_BILL: boolean
    LATE_SURCHARGE: boolean
  }>({
    MONTHLY_BILL: false,
    LATE_SURCHARGE: false,
  })

  // Pagination states
  const [page, setPage] = useState(0) // 0-indexed page
  const [rowsPerPage] = useState(10) // Items per page

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

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [selectedHouseNo, selectedMonth, selectedItems])

  // Fetch houses on initial load (needed for filter dropdown)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'RESIDENT') {
      fetchHouses()
    }
  }, [isAuthenticated, user])

  // Fetch invoices when tab, page, or filters change
  useEffect(() => {
    if (isAuthenticated && user?.role === 'RESIDENT' && activeTab === 0) {
      fetchInvoices()
    }
  }, [isAuthenticated, user, activeTab, page, selectedHouseNo, selectedMonth, selectedItems])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError('')

      // Build query params with pagination and filters
      const params = new URLSearchParams({
        page: String(page + 1), // Backend uses 1-indexed
        limit: String(rowsPerPage),
      })

      // Add filters to query params
      if (selectedHouseNo) {
        params.append('houseNo', selectedHouseNo)
      }
      if (selectedMonth) {
        params.append('month', selectedMonth)
      }
      // Handle item type filter - if both selected, don't filter by item type
      if (selectedItems.MONTHLY_BILL && !selectedItems.LATE_SURCHARGE) {
        params.append('itemType', 'MONTHLY_BILL')
      } else if (selectedItems.LATE_SURCHARGE && !selectedItems.MONTHLY_BILL) {
        params.append('itemType', 'LATE_SURCHARGE')
      }
      // If both are selected, don't send itemType (show all)

      const data = await invoiceAPI.getUserInvoicesPaginated(params.toString())
      setInvoices(data.items)
      setTotalCount(data.total)
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

  const handlePayment = async (invoice: Invoice) => {
    try {
      setProcessingPayment(invoice.id)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })

      const data = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      setError('Failed to initiate payment')
      setProcessingPayment(null)
    }
  }

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

  // Get unique house numbers from houses (for filter dropdown)
  const uniqueHouseNos = useMemo(() => {
    // For invoices tab, we'll get house numbers from houses
    // For better UX, you might want to fetch all unique house numbers separately
    return houses.map((house) => house.houseNo).sort()
  }, [houses])

  // Get unique months - generate last 12 months for filter dropdown
  const uniqueMonths = useMemo(() => {
    const months: string[] = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.push(month)
    }
    return months
  }, [])

  // Filter houses based on house number (client-side for houses tab)
  const filteredHouses = useMemo(() => {
    if (!selectedHouseNo) return houses
    return houses.filter((house) => house.houseNo === selectedHouseNo)
  }, [houses, selectedHouseNo])

  // Paginated houses (only paginate if > 10 items) - client-side for houses
  const paginatedHouses = useMemo(() => {
    if (filteredHouses.length <= 10) return filteredHouses
    const startIndex = page * rowsPerPage
    return filteredHouses.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredHouses, page, rowsPerPage])

  // Calculate total pages - use server total for invoices, client total for houses
  const totalPages = useMemo(() => {
    if (activeTab === 0) {
      // Server-side pagination for invoices
      return Math.ceil(totalCount / rowsPerPage)
    } else {
      // Client-side pagination for houses
      return Math.ceil(filteredHouses.length / rowsPerPage)
    }
  }, [activeTab, totalCount, filteredHouses.length, rowsPerPage])

  // Clear all filters
  const clearFilters = () => {
    setSelectedHouseNo('')
    setSelectedMonth('')
    setSelectedItems({
      MONTHLY_BILL: false,
      LATE_SURCHARGE: false,
    })
  }

  // Check if any filter is active
  const hasActiveFilters = selectedHouseNo || selectedMonth || selectedItems.MONTHLY_BILL || selectedItems.LATE_SURCHARGE

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

        {/* Filter Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={clearFilters}
                sx={{ ml: 'auto' }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* House Number Filter */}
            <FormControl fullWidth size="small">
              <InputLabel>House Number</InputLabel>
              <Select
                value={selectedHouseNo}
                onChange={(e) => setSelectedHouseNo(e.target.value)}
                label="House Number"
              >
                <MenuItem value="">
                  <em>All Houses</em>
                </MenuItem>
                {uniqueHouseNos.map((houseNo) => (
                  <MenuItem key={houseNo} value={houseNo}>
                    {houseNo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Month Filter */}
            {activeTab === 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Month"
                >
                  <MenuItem value="">
                    <em>All Months</em>
                  </MenuItem>
                  {uniqueMonths.map((month) => {
                    const [year, monthNum] = month.split('-')
                    const date = new Date(parseInt(year), parseInt(monthNum) - 1)
                    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
                    return (
                      <MenuItem key={month} value={month}>
                        {monthName}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            )}

            {/* Items Filter (only for Invoice tab) */}
            {activeTab === 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Items</InputLabel>
                <Select
                  multiple
                  value={
                    Object.entries(selectedItems)
                      .filter(([_, checked]) => checked)
                      .map(([key]) => key)
                  }
                  onChange={(e) => {
                    const values = e.target.value as string[]
                    setSelectedItems({
                      MONTHLY_BILL: values.includes('MONTHLY_BILL'),
                      LATE_SURCHARGE: values.includes('LATE_SURCHARGE'),
                    })
                  }}
                  label="Items"
                  renderValue={(selected) => {
                    if (selected.length === 0) return 'All Items'
                    return selected
                      .map((val) => (val === 'MONTHLY_BILL' ? 'Monthly Bill' : 'Late Surcharge'))
                      .join(', ')
                  }}
                >
                  <MenuItem value="MONTHLY_BILL">
                    <Checkbox checked={selectedItems.MONTHLY_BILL} />
                    Monthly Bill
                  </MenuItem>
                  <MenuItem value="LATE_SURCHARGE">
                    <Checkbox checked={selectedItems.LATE_SURCHARGE} />
                    Late Surcharge
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Invoice Tab */}
        {activeTab === 0 && (
          <>
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
                      <TableCell colSpan={6} align="center">
                        {hasActiveFilters ? 'No invoices match the selected filters' : 'No invoices found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => {
                      const total = calculateInvoiceTotal(invoice)
                      const paymentStatus = getPaymentStatus(invoice)
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{invoice.house?.houseNo || 'N/A'}</TableCell>
                          <TableCell>${total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip label={paymentStatus.label} color={paymentStatus.color} size="small" />
                          </TableCell>
                          <TableCell>
                            <Accordion>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="body2">
                                  {invoice.items?.length || 0} item(s)
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Box>
                                  {invoice.items?.map((item) => (
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
                                  )) || <Typography variant="body2">No items</Typography>}
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

            {/* Pagination - only show if more than 10 items */}
            {totalCount > 10 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1} // Material-UI uses 1-indexed pages
                  onChange={(event, value) => setPage(value - 1)} // Convert back to 0-indexed
                  color="primary"
                  showFirstButton
                  showLastButton
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Showing {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount} invoices
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* House Tab */}
        {activeTab === 1 && (
          <>
            <Grid container spacing={3}>
              {paginatedHouses.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">
                    {hasActiveFilters ? 'No houses match the selected filters' : 'No houses found'}
                  </Alert>
                </Grid>
              ) : (
                paginatedHouses.map((house) => (
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

            {/* Pagination - only show if more than 10 items */}
            {filteredHouses.length > 10 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(event, value) => setPage(value - 1)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Showing {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, filteredHouses.length)} of {filteredHouses.length} houses
                </Typography>
              </Box>
            )}
          </>
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
