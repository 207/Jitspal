import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { fabric } from 'fabric';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  Add,
  Circle,
  ArrowForward,
  Highlight,
  Comment,
  Save,
  Clear
} from '@mui/icons-material';

const VideoPlayer = ({ videoUrl, annotations = [], onAnnotationCreate, onAnnotationUpdate, onAnnotationDelete, isCoach = false }) => {
  const playerRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  
  const [playing, setPlaying] = useState(false);
  const [volume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Annotation states
  const [annotationMode, setAnnotationMode] = useState('comment');
  const [annotationText, setAnnotationText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool] = useState('circle');
  const [annotationColor] = useState('#ff0000');
  const [showAnnotations] = useState(true);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
          width: 640,
          height: 360,
          backgroundColor: 'transparent'
        });

        // Handle drawing events
        fabricCanvasRef.current.on('mouse:down', handleMouseDown);
        fabricCanvasRef.current.on('mouse:move', handleMouseMove);
        fabricCanvasRef.current.on('mouse:up', handleMouseUp);
      } catch (error) {
        console.error('Error initializing Fabric.js canvas:', error);
      }
    }

    return () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        } catch (error) {
          console.error('Error disposing Fabric.js canvas:', error);
        }
      }
    };
  }, []);

  // Update canvas size when video loads
  useEffect(() => {
    const updateCanvasSize = () => {
      if (fabricCanvasRef.current && playerRef.current) {
        const videoElement = playerRef.current.getInternalPlayer();
        if (videoElement) {
          const rect = videoElement.getBoundingClientRect();
          fabricCanvasRef.current.setDimensions({
            width: rect.width,
            height: rect.height
          });
        }
      }
    };

    if (duration > 0) {
      // Update immediately
      updateCanvasSize();
      
      // Update on window resize
      window.addEventListener('resize', updateCanvasSize);
      
      return () => {
        window.removeEventListener('resize', updateCanvasSize);
      };
    }
  }, [duration]);

  // Load annotations onto canvas
  useEffect(() => {
    if (fabricCanvasRef.current && showAnnotations) {
      try {
        fabricCanvasRef.current.clear();
        
        annotations.forEach(annotation => {
          if (annotation.type !== 'comment' && annotation.content.drawingData) {
            try {
              fabric.util.enlivenObjects([annotation.content.drawingData], (objects) => {
                objects.forEach(obj => {
                  if (fabricCanvasRef.current) {
                    fabricCanvasRef.current.add(obj);
                  }
                });
              });
            } catch (error) {
              console.error('Error loading annotation:', error);
            }
          }
        });
      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    }
  }, [annotations, showAnnotations]);

  const handleMouseDown = (e) => {
    if (annotationMode === 'comment' || !isCoach || !fabricCanvasRef.current) return;
    
    setIsDrawing(true);
    const pointer = fabricCanvasRef.current.getPointer(e.e);
    
    if (drawingTool === 'circle') {
      const circle = new fabric.Circle({
        left: pointer.x - 25,
        top: pointer.y - 25,
        radius: 25,
        fill: 'transparent',
        stroke: annotationColor,
        strokeWidth: 3
      });
      fabricCanvasRef.current.add(circle);
    } else if (drawingTool === 'arrow') {
      const arrow = new fabric.Line([pointer.x, pointer.y, pointer.x + 50, pointer.y], {
        stroke: annotationColor,
        strokeWidth: 3,
        originX: 'center',
        originY: 'center'
      });
      fabricCanvasRef.current.add(arrow);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || annotationMode === 'comment') return;
    // Handle drawing continuation if needed
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
    }
  };

  const handleSeekChange = (e, newValue) => {
    setPlayed(newValue);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e, newValue) => {
    setSeeking(false);
    playerRef.current.seekTo(newValue);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
    }
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  };

  const handleAddComment = () => {
    if (annotationText.trim() && isCoach) {
      onAnnotationCreate({
        timestamp: currentTime,
        type: 'comment',
        content: {
          text: annotationText
        }
      });
      setAnnotationText('');
    }
  };

  const handleSaveDrawing = () => {
    if (fabricCanvasRef.current && isCoach) {
      try {
        const objects = fabricCanvasRef.current.getObjects();
        if (objects.length > 0) {
          const drawingData = objects.map(obj => obj.toObject());
          onAnnotationCreate({
            timestamp: currentTime,
            type: drawingTool,
            content: {
              drawingData: drawingData,
              color: annotationColor
            }
          });
          fabricCanvasRef.current.clear();
        }
      } catch (error) {
        console.error('Error saving drawing:', error);
      }
    }
  };

  const handleClearCanvas = () => {
    if (fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current.clear();
      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    }
  };

  const jumpToAnnotation = (timestamp) => {
    playerRef.current.seekTo(timestamp);
    setCurrentTime(timestamp);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Video Player */}
      <Box sx={{ 
        position: 'relative', 
        width: '100%',
        backgroundColor: '#000',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          volume={volume}
          muted={muted}
          onProgress={handleProgress}
          onDuration={handleDuration}
          width="100%"
          height="auto"
          style={{ borderRadius: '4px' }}
        />
        
        {/* Annotation Canvas Overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: isCoach ? 'auto' : 'none',
            zIndex: 10,
            borderRadius: '4px',
            cursor: isCoach && annotationMode !== 'comment' ? 'crosshair' : 'default'
          }}
        />
        
        {/* Annotation Mode Indicator */}
        {isCoach && annotationMode !== 'comment' && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {annotationMode === 'circle' && <Circle fontSize="small" />}
            {annotationMode === 'arrow' && <ArrowForward fontSize="small" />}
            {annotationMode === 'highlight' && <Highlight fontSize="small" />}
            <Typography variant="caption">
              {annotationMode === 'circle' && 'Click to draw circle'}
              {annotationMode === 'arrow' && 'Click to draw arrow'}
              {annotationMode === 'highlight' && 'Click to highlight'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Video Controls */}
      <Paper sx={{ p: 2, mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => setPlaying(!playing)}>
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>
          
          <IconButton onClick={() => setMuted(!muted)}>
            {muted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          
          <Typography variant="body2" sx={{ minWidth: 60 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
          
          <Box sx={{ flexGrow: 1, mx: 2 }}>
            <Slider
              value={played}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onChangeCommitted={handleSeekMouseUp}
              min={0}
              max={1}
              step={0.001}
            />
          </Box>
          
          <IconButton>
            <Fullscreen />
          </IconButton>
        </Box>

        {/* Annotation Tools (Coach Only) */}
        {isCoach && (
          <Box sx={{ 
            borderTop: 1, 
            borderColor: 'divider', 
            pt: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            p: 2
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              🎯 Annotation Tools
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Annotation Tool</InputLabel>
                <Select
                  value={annotationMode}
                  label="Annotation Tool"
                  onChange={(e) => setAnnotationMode(e.target.value)}
                >
                  <MenuItem value="comment">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Comment fontSize="small" />
                      Add Comment
                    </Box>
                  </MenuItem>
                  <MenuItem value="circle">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Circle fontSize="small" />
                      Draw Circle
                    </Box>
                  </MenuItem>
                  <MenuItem value="arrow">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArrowForward fontSize="small" />
                      Draw Arrow
                    </Box>
                  </MenuItem>
                  <MenuItem value="highlight">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Highlight fontSize="small" />
                      Highlight Area
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {annotationMode === 'comment' ? (
                <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add a comment at this timestamp..."
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddComment}
                    disabled={!annotationText.trim()}
                    startIcon={<Add />}
                  >
                    Add Comment
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Click on the video to {annotationMode === 'circle' ? 'draw a circle' : 
                    annotationMode === 'arrow' ? 'draw an arrow' : 'highlight an area'}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveDrawing}
                    startIcon={<Save />}
                    color="success"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearCanvas}
                    startIcon={<Clear />}
                    color="warning"
                  >
                    Clear
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Annotations List */}
      {annotations.length > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Annotations ({annotations.length})
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {annotations
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((annotation, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  onClick={() => jumpToAnnotation(annotation.timestamp)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={formatTime(annotation.timestamp)}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={annotation.type}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  {annotation.content.text && (
                    <Typography variant="body2">
                      {annotation.content.text}
                    </Typography>
                  )}
                </Box>
              ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default VideoPlayer;


