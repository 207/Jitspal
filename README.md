# JitsPal - BJJ Video Analysis Platform

A comprehensive web platform for Brazilian Jiu Jitsu practitioners to upload, analyze, and receive feedback on their rolling and competition videos. Coaches can provide timestamped comments and visual annotations directly on videos, while students can view all feedback in one organized place.

## 🥋 Features

### For Students
- **Video Upload**: Upload rolling and competition videos to the cloud
- **Coach Feedback**: Receive detailed timestamped comments from coaches
- **Visual Annotations**: See circles, arrows, and highlights drawn directly on videos
- **Progress Tracking**: View all feedback and improvements over time
- **Mobile Friendly**: Access your videos and feedback on any device

### For Coaches
- **Video Analysis**: Watch student videos in a professional video player
- **Timestamped Comments**: Leave detailed feedback at specific moments
- **Visual Tools**: Draw circles, arrows, and highlights directly on videos
- **Student Management**: Organize and track multiple students
- **Real-time Collaboration**: Provide feedback that students can see immediately

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Material-UI (MUI)** - Professional component library
- **React Router** - Client-side routing
- **Fabric.js** - Canvas drawing and annotation tools
- **React Player** - Video playback
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Cloudinary** - Video storage and processing
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File upload handling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for video storage)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jitspal
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/jitspal
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=5000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

## 🎯 Usage

### Getting Started

1. **Register an Account**
   - Visit `http://localhost:3000/register`
   - Choose your role (Student or Coach)
   - Fill in your details including belt level and academy

2. **Upload Your First Video**
   - Click "Upload Video" from the dashboard
   - Select a video file (MP4, MOV, AVI supported)
   - Add title, description, and tags
   - For students: optionally assign to a coach

3. **Analyze Videos (Coaches)**
   - Open a video from your dashboard
   - Use the annotation tools to add feedback:
     - **Comments**: Click "Comment" and type feedback
     - **Circles**: Draw circles around areas of interest
     - **Arrows**: Point to specific techniques or positions
     - **Highlights**: Mark important moments

4. **View Feedback (Students)**
   - Open your uploaded videos
   - See all coach annotations and comments
   - Click on timestamps to jump to specific moments
   - Reply to comments for clarification

## 🏗️ Project Structure

```
jitspal/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── index.js          # Server entry point
└── package.json          # Root package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Videos
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/my-videos` - Get user's videos
- `GET /api/videos/:id` - Get specific video
- `PUT /api/videos/:id` - Update video details
- `DELETE /api/videos/:id` - Delete video

### Annotations
- `POST /api/annotations` - Create annotation
- `GET /api/annotations/video/:videoId` - Get video annotations
- `PUT /api/annotations/:id` - Update annotation
- `DELETE /api/annotations/:id` - Delete annotation
- `POST /api/annotations/:id/replies` - Add reply to annotation
- `POST /api/annotations/:id/reactions` - Add reaction to annotation

## 🎨 Key Features Implementation

### Video Annotation System
- **Fabric.js Integration**: Canvas overlay for drawing tools
- **Timestamp Synchronization**: Annotations linked to specific video moments
- **Real-time Updates**: Socket.io for live collaboration
- **Persistent Storage**: MongoDB for annotation data

### Video Upload & Processing
- **Cloudinary Integration**: Secure cloud storage and processing
- **Progress Tracking**: Real-time upload progress
- **File Validation**: Type and size checking
- **Thumbnail Generation**: Automatic video thumbnails

### User Management
- **Role-based Access**: Different permissions for coaches and students
- **JWT Authentication**: Secure token-based auth
- **Profile Management**: User details and preferences

## 🚀 Deployment

### Production Build
```bash
# Build the frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Variables for Production
- Set up MongoDB Atlas or your preferred MongoDB hosting
- Configure Cloudinary with production credentials
- Use a strong JWT secret
- Set appropriate CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Brazilian Jiu Jitsu community for inspiration
- Material-UI team for the excellent component library
- Fabric.js for canvas drawing capabilities
- Cloudinary for video storage solutions

## 📞 Support

For support, email support@jitspal.com or create an issue in the repository.

---

**JitsPal** - Elevate your BJJ game with professional video analysis! 🥋



