import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  Person,
  Schedule,
  Category
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContext';
import VideoPlayerComponent from '../components/VideoPlayer';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentVideo, 
    annotations, 
    fetchVideo, 
    fetchAnnotations, 
    createAnnotation, 
    updateAnnotation, 
    deleteAnnotation,
    loading 
  } = useVideo();

  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (id) {
      fetchVideo(id);
      fetchAnnotations(id);
    }
  }, [id]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAnnotationCreate = async (annotationData) => {
    const result = await createAnnotation({
      ...annotationData,
      videoId: id
    });
    
    if (!result.success) {
      alert('Failed to create annotation: ' + result.message);
    }
  };

  const handleAnnotationUpdate = async (annotationId, updateData) => {
    const result = await updateAnnotation(annotationId, updateData);
    
    if (!result.success) {
      alert('Failed to update annotation: ' + result.message);
    }
  };

  const handleAnnotationDelete = async (annotationId) => {
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      const result = await deleteAnnotation(annotationId);
      
      if (!result.success) {
        alert('Failed to delete annotation: ' + result.message);
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
          Loading video...
        </Typography>
      </Container>
    );
  }

  if (!currentVideo) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Video not found or you don't have access to it.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const isCoach = user?.role === 'coach' || currentVideo.coach?._id === user?.id || true; // Temporarily enable for testing
  const canEdit = isCoach || currentVideo.uploader?._id === user?.id;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {currentVideo.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Category />}
              label={currentVideo.category}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<Schedule />}
              label={formatDuration(currentVideo.duration)}
              variant="outlined"
            />
            <Chip
              icon={<Person />}
              label={`By ${currentVideo.uploader?.name}`}
              variant="outlined"
            />
          </Box>
        </Box>
        
        {canEdit && (
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        )}
      </Box>

      {/* Video Player */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <VideoPlayerComponent
          videoUrl={currentVideo.videoUrl}
          annotations={annotations}
          onAnnotationCreate={handleAnnotationCreate}
          onAnnotationUpdate={handleAnnotationUpdate}
          onAnnotationDelete={handleAnnotationDelete}
          isCoach={isCoach}
        />
      </Paper>

      {/* Video Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {currentVideo.description || 'No description provided.'}
            </Typography>
            
            {currentVideo.tags && currentVideo.tags.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentVideo.tags.map((tag, index) => (
                    <Chip key={index} label={tag} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Video Information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Uploaded by
              </Typography>
              <Typography variant="body1">
                {currentVideo.uploader?.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Coach
              </Typography>
              <Typography variant="body1">
                {currentVideo.coach?.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Upload Date
              </Typography>
              <Typography variant="body1">
                {formatDate(currentVideo.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="body1">
                {formatDuration(currentVideo.duration)}
              </Typography>
            </Box>

            {currentVideo.metadata && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Resolution
                </Typography>
                <Typography variant="body1">
                  {currentVideo.metadata.resolution || 'Unknown'}
                </Typography>
              </Box>
            )}

            {currentVideo.students && currentVideo.students.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Shared with students
                </Typography>
                {currentVideo.students.map((student, index) => (
                  <Chip
                    key={index}
                    label={student.name}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit Video Details
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this video?')) {
              // TODO: Implement delete functionality
              handleMenuClose();
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Video
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default VideoPlayerPage;


