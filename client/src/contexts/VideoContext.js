import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const VideoContext = createContext();

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadVideo = async (formData, onProgress) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) onProgress(percentCompleted);
        },
      });
      
      // Refresh videos list
      await fetchVideos();
      
      return { success: true, video: response.data.video };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Upload failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/videos/my-videos');
      setVideos(response.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch videos' 
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchVideo = async (videoId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/videos/${videoId}`);
      setCurrentVideo(response.data);
      return { success: true, video: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch video' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateVideo = async (videoId, updateData) => {
    try {
      const response = await axios.put(`/api/videos/${videoId}`, updateData);
      
      // Update current video if it's the same
      if (currentVideo && currentVideo._id === videoId) {
        setCurrentVideo(response.data);
      }
      
      // Update videos list
      setVideos(videos.map(video => 
        video._id === videoId ? response.data : video
      ));
      
      return { success: true, video: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      };
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      await axios.delete(`/api/videos/${videoId}`);
      
      // Remove from videos list
      setVideos(videos.filter(video => video._id !== videoId));
      
      // Clear current video if it's the deleted one
      if (currentVideo && currentVideo._id === videoId) {
        setCurrentVideo(null);
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Delete failed' 
      };
    }
  };

  const fetchAnnotations = async (videoId) => {
    try {
      const response = await axios.get(`/api/annotations/video/${videoId}`);
      setAnnotations(response.data);
      return { success: true, annotations: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch annotations' 
      };
    }
  };

  const createAnnotation = async (annotationData) => {
    try {
      const response = await axios.post('/api/annotations', annotationData);
      setAnnotations([...annotations, response.data]);
      return { success: true, annotation: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create annotation' 
      };
    }
  };

  const updateAnnotation = async (annotationId, updateData) => {
    try {
      const response = await axios.put(`/api/annotations/${annotationId}`, updateData);
      
      setAnnotations(annotations.map(annotation => 
        annotation._id === annotationId ? response.data : annotation
      ));
      
      return { success: true, annotation: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update annotation' 
      };
    }
  };

  const deleteAnnotation = async (annotationId) => {
    try {
      await axios.delete(`/api/annotations/${annotationId}`);
      
      setAnnotations(annotations.filter(annotation => annotation._id !== annotationId));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete annotation' 
      };
    }
  };

  const addReply = async (annotationId, text) => {
    try {
      const response = await axios.post(`/api/annotations/${annotationId}/replies`, { text });
      
      setAnnotations(annotations.map(annotation => 
        annotation._id === annotationId ? response.data : annotation
      ));
      
      return { success: true, annotation: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add reply' 
      };
    }
  };

  const addReaction = async (annotationId, type) => {
    try {
      const response = await axios.post(`/api/annotations/${annotationId}/reactions`, { type });
      
      setAnnotations(annotations.map(annotation => 
        annotation._id === annotationId ? response.data : annotation
      ));
      
      return { success: true, annotation: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add reaction' 
      };
    }
  };

  const value = {
    videos,
    currentVideo,
    annotations,
    loading,
    uploadVideo,
    fetchVideos,
    fetchVideo,
    updateVideo,
    deleteVideo,
    fetchAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addReply,
    addReaction,
    setCurrentVideo,
    setAnnotations
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};



