import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PlayArrow,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Upload
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { videos, fetchVideos, deleteVideo, loading } = useVideo();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleMenuOpen = (event, video) => {
    setAnchorEl(event.currentTarget);
    setSelectedVideo(video);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVideo(null);
  };

  const handleDelete = async () => {
    if (selectedVideo) {
      const result = await deleteVideo(selectedVideo._id);
      if (result.success) {
        handleMenuClose();
      } else {
        alert('Failed to delete video: ' + result.message);
      }
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your videos...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {user?.role === 'coach' ? 'Coach' : 'Student'} Dashboard
          </Typography>
        </Box>
        <Button
          variant="contained"
          component={Link}
          to="/upload"
          startIcon={<Upload />}
          size="large"
        >
          Upload Video
        </Button>
      </Box>

      {videos.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h5" gutterBottom>
            No videos yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {user?.role === 'coach' 
              ? 'Start by uploading a video to analyze and provide feedback to your students.'
              : 'Upload your first BJJ video to get feedback from your coach.'
            }
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/upload"
            startIcon={<Upload />}
            size="large"
          >
            Upload Your First Video
          </Button>
        </Card>
      ) : (
        <>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Your Videos ({videos.length})
          </Typography>
          
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={video.thumbnailUrl || '/api/placeholder/400/200'}
                      alt={video.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      <Chip
                        label={video.category}
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                      <Chip
                        label={formatDuration(video.duration)}
                        size="small"
                        sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
                      />
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        right: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <IconButton
                        component={Link}
                        to={`/video/${video._id}`}
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.8)'
                          }
                        }}
                      >
                        <PlayArrow />
                      </IconButton>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, video)}
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.8)'
                          }
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {video.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded {formatDate(video.createdAt)} by {video.uploader?.name}
                    </Typography>
                    {video.tags && video.tags.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {video.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {video.tags.length > 3 && (
                          <Chip
                            label={`+${video.tags.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to={`/video/${video._id}`}
                      startIcon={<Visibility />}
                    >
                      View
                    </Button>
                    {user?.role === 'coach' && (
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => {
                          // TODO: Implement edit functionality
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={Link}
          to={`/video/${selectedVideo?._id}`}
          onClick={handleMenuClose}
        >
          <Visibility sx={{ mr: 1 }} />
          View Video
        </MenuItem>
        {user?.role === 'coach' && (
          <MenuItem onClick={handleMenuClose}>
            <Edit sx={{ mr: 1 }} />
            Edit Details
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Dashboard;



