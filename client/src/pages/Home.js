import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Paper
} from '@mui/material';
import {
  VideoLibrary,
  School,
  Timeline,
  Group
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <VideoLibrary sx={{ fontSize: 60, color: '#1976d2' }} />,
      title: 'Video Upload & Storage',
      description: 'Upload your BJJ rolling and competition videos to the cloud with secure storage and easy access.'
    },
    {
      icon: <Timeline sx={{ fontSize: 60, color: '#1976d2' }} />,
      title: 'Timestamped Comments',
      description: 'Coaches can leave detailed feedback at specific moments in your videos for precise instruction.'
    },
    {
      icon: <School sx={{ fontSize: 60, color: '#1976d2' }} />,
      title: 'Visual Annotations',
      description: 'Draw circles, arrows, and highlights directly on the video to point out techniques and positions.'
    },
    {
      icon: <Group sx={{ fontSize: 60, color: '#1976d2' }} />,
      title: 'Coach-Student Collaboration',
      description: 'Seamless communication between coaches and students with real-time feedback and discussions.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              JitsPal
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
              The Ultimate BJJ Video Analysis Platform
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, maxWidth: 600, mx: 'auto', opacity: 0.8 }}>
              Upload your rolling videos, get detailed feedback from coaches, and improve your game with timestamped annotations and visual feedback.
            </Typography>
            {!isAuthenticated && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/register"
                  sx={{
                    backgroundColor: 'white',
                    color: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/login"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Sign In
                </Button>
              </Box>
            )}
            {isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/dashboard"
                sx={{
                  backgroundColor: 'white',
                  color: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Go to Dashboard
              </Button>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Why Choose JitsPal?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to analyze and improve your BJJ game
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            py: 6,
            mb: 6
          }}
        >
          <Container maxWidth="md">
            <Box textAlign="center">
              <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                Ready to Improve Your Game?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Join thousands of BJJ practitioners who are already using JitsPal to get better feedback and improve faster.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                sx={{ px: 4, py: 2 }}
              >
                Start Your Free Trial
              </Button>
            </Box>
          </Container>
        </Paper>
      )}
    </Box>
  );
};

export default Home;



