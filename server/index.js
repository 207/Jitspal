const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Placeholder thumbnail endpoint
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#666">
        Video Thumbnail
      </text>
    </svg>
  `;
  res.set('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/annotations', require('./routes/annotations'));

// Socket.io for real-time collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-video', (videoId) => {
    socket.join(videoId);
    console.log(`User ${socket.id} joined video ${videoId}`);
  });
  
  socket.on('annotation-update', (data) => {
    socket.to(data.videoId).emit('annotation-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jitspal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


