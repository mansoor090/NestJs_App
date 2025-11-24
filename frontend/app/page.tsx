'use client'

import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField } from '@mui/material'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <Navbar />

      {/* Landing Area - 25% */}
      <Box
        sx={{
          height: '25vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" align="center" gutterBottom>
            Welcome to Project Test
          </Typography>
          <Typography variant="h5" align="center">
            Your trusted partner for excellence
          </Typography>
        </Container>
      </Box>

      {/* Portfolio Section - 10% */}
      <Box sx={{ py: 8, bgcolor: '#f5f5f5' }}>
        <Container>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 4 }}>
            Our Partners & Projects
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {['EME', 'P&D', 'Bahria Town', 'Wahdat Colony', 'Iqbal Avenue'].map((name) => (
              <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Us & Contact - 25% */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Grid container spacing={6}>
            {/* About Us */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                About Us
              </Typography>
              <Typography variant="body1" paragraph>
                We are a leading company dedicated to providing exceptional services
                and building strong partnerships. Our commitment to excellence drives
                everything we do.
              </Typography>
              <Typography variant="body1" paragraph>
                With years of experience and a team of dedicated professionals, we
                strive to deliver the best solutions for our clients and partners.
              </Typography>
            </Grid>

            {/* Contact Us */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Contact Us for Business
              </Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  margin="normal"
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 2 }}
                >
                  Send Message
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          bgcolor: 'primary.dark',
          color: 'white',
          py: 3,
          mt: 'auto',
        }}
      >
        <Container>
          <Typography variant="body1" align="center">
            © {new Date().getFullYear()} Test Company. All rights reserved.
          </Typography>
        </Container>
      </Box>

    </Box>
  )
}