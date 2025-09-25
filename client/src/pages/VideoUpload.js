import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload,
  VideoFile,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContext';

const VideoUpload = () => {
  const { user } = useAuth();
  const { uploadVideo, loading } = useVideo();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'rolling',
    tags: '',
    coachId: user?.role === 'student' ? '' : user?.id
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      
      // Validate file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setError('');

    const uploadFormData = new FormData();
    uploadFormData.append('video', selectedFile);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('category', formData.category);
    uploadFormData.append('tags', formData.tags);
    
    if (user?.role === 'student' && formData.coachId) {
      uploadFormData.append('coachId', formData.coachId);
    }

    const result = await uploadVideo(uploadFormData, (progress) => {
      setUploadProgress(progress);
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate(`/video/${result.video.id}`);
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Card sx={{ p: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Upload Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your video has been uploaded and is being processed. You'll be redirected to the video player shortly.
          </Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Upload Video
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Upload your BJJ rolling or competition video for analysis and feedback.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* File Upload */}
            <Grid item xs={12}>
              <Card
                sx={{
                  border: 2,
                  borderColor: selectedFile ? 'success.main' : 'grey.300',
                  borderStyle: 'dashed',
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => document.getElementById('video-upload').click()}
              >
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                {selectedFile ? (
                  <Box>
                    <VideoFile sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                    <Button
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      Change File
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <CloudUpload sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Click to select video file
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports MP4, MOV, AVI, and other video formats
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Maximum file size: 500MB
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Upload Progress */}
            {uploading && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Uploading... {uploadProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              </Grid>
            )}

            {/* Video Details */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Video Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Rolling Session - Guard Passing"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                >
                  <MenuItem value="rolling">Rolling</MenuItem>
                  <MenuItem value="competition">Competition</MenuItem>
                  <MenuItem value="technique">Technique</MenuItem>
                  <MenuItem value="drill">Drill</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Describe what's happening in the video, techniques being practiced, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (Optional)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="guard, passing, submissions (comma separated)"
                helperText="Add tags to help categorize your video"
              />
            </Grid>

            {user?.role === 'student' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Coach Email (Optional)"
                  name="coachId"
                  value={formData.coachId}
                  onChange={handleChange}
                  placeholder="Enter your coach's email to share the video"
                  helperText="Leave blank if you want to assign a coach later"
                />
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
              disabled={uploading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VideoUpload;



