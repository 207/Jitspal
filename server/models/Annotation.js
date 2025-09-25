const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Number, // in seconds
    required: true
  },
  type: {
    type: String,
    enum: ['comment', 'drawing', 'circle', 'arrow', 'highlight'],
    required: true
  },
  content: {
    text: String,
    drawingData: mongoose.Schema.Types.Mixed, // For fabric.js canvas data
    coordinates: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    color: {
      type: String,
      default: '#ff0000'
    },
    strokeWidth: {
      type: Number,
      default: 2
    }
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'dislike', 'helpful'],
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
annotationSchema.index({ video: 1, timestamp: 1 });
annotationSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Annotation', annotationSchema);



