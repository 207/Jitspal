const express = require('express');
const Annotation = require('../models/Annotation');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

const router = express.Router();

// Create annotation
router.post('/', auth, async (req, res) => {
  try {
    const { videoId, timestamp, type, content } = req.body;

    // Verify video exists and user has access
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const hasAccess = video.uploader.toString() === req.userId.toString() ||
                     video.coach.toString() === req.userId.toString() ||
                     video.students.some(student => student.toString() === req.userId.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const annotation = new Annotation({
      video: videoId,
      author: req.userId,
      timestamp,
      type,
      content
    });

    await annotation.save();
    await annotation.populate('author', 'name email');

    res.status(201).json(annotation);
  } catch (error) {
    console.error('Create annotation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get annotations for a video
router.get('/video/:videoId', auth, async (req, res) => {
  try {
    // Verify video exists and user has access
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const hasAccess = video.uploader.toString() === req.userId.toString() ||
                     video.coach.toString() === req.userId.toString() ||
                     video.students.some(student => student.toString() === req.userId.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const annotations = await Annotation.find({ video: req.params.videoId })
      .populate('author', 'name email role')
      .populate('replies.author', 'name email')
      .sort({ timestamp: 1 });

    res.json(annotations);
  } catch (error) {
    console.error('Get annotations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update annotation
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, isVisible } = req.body;

    const annotation = await Annotation.findById(req.params.id);
    if (!annotation) {
      return res.status(404).json({ message: 'Annotation not found' });
    }

    // Check if user is the author or coach
    const video = await Video.findById(annotation.video);
    const isAuthor = annotation.author.toString() === req.userId.toString();
    const isCoach = video.coach.toString() === req.userId.toString();

    if (!isAuthor && !isCoach) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAnnotation = await Annotation.findByIdAndUpdate(
      req.params.id,
      { content, isVisible },
      { new: true }
    ).populate('author', 'name email role')
     .populate('replies.author', 'name email');

    res.json(updatedAnnotation);
  } catch (error) {
    console.error('Update annotation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete annotation
router.delete('/:id', auth, async (req, res) => {
  try {
    const annotation = await Annotation.findById(req.params.id);
    if (!annotation) {
      return res.status(404).json({ message: 'Annotation not found' });
    }

    // Check if user is the author or coach
    const video = await Video.findById(annotation.video);
    const isAuthor = annotation.author.toString() === req.userId.toString();
    const isCoach = video.coach.toString() === req.userId.toString();

    if (!isAuthor && !isCoach) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Annotation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    console.error('Delete annotation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reply to annotation
router.post('/:id/replies', auth, async (req, res) => {
  try {
    const { text } = req.body;

    const annotation = await Annotation.findById(req.params.id);
    if (!annotation) {
      return res.status(404).json({ message: 'Annotation not found' });
    }

    // Verify user has access to the video
    const video = await Video.findById(annotation.video);
    const hasAccess = video.uploader.toString() === req.userId.toString() ||
                     video.coach.toString() === req.userId.toString() ||
                     video.students.some(student => student.toString() === req.userId.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    annotation.replies.push({
      author: req.userId,
      text
    });

    await annotation.save();
    await annotation.populate('replies.author', 'name email');

    res.json(annotation);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction to annotation
router.post('/:id/reactions', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'like', 'dislike', 'helpful'

    const annotation = await Annotation.findById(req.params.id);
    if (!annotation) {
      return res.status(404).json({ message: 'Annotation not found' });
    }

    // Verify user has access to the video
    const video = await Video.findById(annotation.video);
    const hasAccess = video.uploader.toString() === req.userId.toString() ||
                     video.coach.toString() === req.userId.toString() ||
                     video.students.some(student => student.toString() === req.userId.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove existing reaction from this user
    annotation.reactions = annotation.reactions.filter(
      reaction => reaction.user.toString() !== req.userId.toString()
    );

    // Add new reaction
    annotation.reactions.push({
      user: req.userId,
      type
    });

    await annotation.save();
    res.json(annotation);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



