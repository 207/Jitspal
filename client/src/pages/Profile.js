import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Person,
  Email,
  School,
  EmojiEvents,
  Edit
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    academy: user?.academy || '',
    belt: user?.belt || 'white'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const getBeltColor = (belt) => {
    const colors = {
      white: '#ffffff',
      blue: '#1976d2',
      purple: '#9c27b0',
      brown: '#8d6e63',
      black: '#000000'
    };
    return colors[belt] || '#ffffff';
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'coach':
        return <School />;
      case 'student':
        return <Person />;
      default:
        return <Person />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {getRoleIcon(user?.role)}
                <Typography variant="body1" sx={{ ml: 1, textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <EmojiEvents sx={{ color: getBeltColor(user?.belt), mr: 1 }} />
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {user?.belt} Belt
                </Typography>
              </Box>

              {user?.academy && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <School sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {user.academy}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Email sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Edit sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                Edit Profile
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Academy/Gym"
                name="academy"
                value={formData.academy}
                onChange={handleChange}
                margin="normal"
                placeholder="Enter your academy or gym name"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Belt Level</InputLabel>
                <Select
                  name="belt"
                  value={formData.belt}
                  label="Belt Level"
                  onChange={handleChange}
                >
                  <MenuItem value="white">White Belt</MenuItem>
                  <MenuItem value="blue">Blue Belt</MenuItem>
                  <MenuItem value="purple">Purple Belt</MenuItem>
                  <MenuItem value="brown">Brown Belt</MenuItem>
                  <MenuItem value="black">Black Belt</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Edit />}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;



