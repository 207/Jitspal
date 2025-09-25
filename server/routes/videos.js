const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/videos');
const thumbnailsDir = path.join(__dirname, '../uploads/thumbnails');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Function to generate thumbnail from video
const generateThumbnail = (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01.000'], // Take screenshot at 1 second
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: '400x200'
      })
      .on('end', () => {
        console.log('Thumbnail generated successfully');
        resolve(thumbnailPath);
      })
      .on('error', (err) => {
        console.error('Error generating thumbnail:', err);
        reject(err);
      });
  });
};

// Upload video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const { title, description, category, tags, coachId } = req.body;

    // Create local file URL
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    // Generate thumbnail from video
    const videoPath = path.join(uploadsDir, req.file.filename);
    const thumbnailFilename = `thumb_${req.file.filename.replace(/\.[^/.]+$/, '.jpg')}`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
    let thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;

    try {
      // Generate thumbnail
      await generateThumbnail(videoPath, thumbnailPath);
      console.log('Thumbnail generated:', thumbnailUrl);
    } catch (error) {
      console.error('Failed to generate thumbnail, using placeholder:', error);
      // Fallback to placeholder if thumbnail generation fails
      thumbnailUrl = '/api/placeholder/400/200';
    }

    // Create video record
    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration: 0, // We'll need to get this from the video file
      uploader: req.userId,
      coach: coachId || req.userId,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      metadata: {
        fileSize: req.file.size,
        resolution: 'unknown', // We'll need to extract this from the video
        format: req.file.mimetype,
        filename: req.file.filename
      }
    });

    await video.save();

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        status: video.status
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Get all videos for a user
router.get('/my-videos', auth, async (req, res) => {
  try {
    const videos = await Video.find({
      $or: [
        { uploader: req.userId },
        { coach: req.userId },
        { students: req.userId }
      ]
    })
    .populate('uploader', 'name email')
    .populate('coach', 'name email')
    .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single video
router.get('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploader', 'name email belt')
      .populate('coach', 'name email')
      .populate('students', 'name email belt');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user has access to this video
    const hasAccess = video.uploader._id.toString() === req.userId.toString() ||
                     video.coach._id.toString() === req.userId.toString() ||
                     video.students.some(student => student._id.toString() === req.userId.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update video
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, tags, students } = req.body;
    
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is the coach or uploader
    if (video.coach.toString() !== req.userId.toString() && 
        video.uploader.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : video.tags,
        students: students ? students.split(',').map(id => id.trim()) : video.students
      },
      { new: true }
    ).populate('uploader', 'name email')
     .populate('coach', 'name email')
     .populate('students', 'name email belt');

    res.json(updatedVideo);
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is the coach or uploader
    if (video.coach.toString() !== req.userId.toString() && 
        video.uploader.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete local file and thumbnail
    if (video.metadata && video.metadata.filename) {
      const filePath = path.join(uploadsDir, video.metadata.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete thumbnail
      const thumbnailFilename = `thumb_${video.metadata.filename.replace(/\.[^/.]+$/, '.jpg')}`;
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


