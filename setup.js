#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🥋 Setting up JitsPal - BJJ Video Analysis Platform\n');

// Check if .env file exists in server directory
const envPath = path.join(__dirname, 'server', '.env');
const envExamplePath = path.join(__dirname, 'server', 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from template');
    console.log('📝 Please edit server/.env with your configuration');
  } else {
    // Create basic .env file
    const envContent = `MONGODB_URI=mongodb://localhost:27017/jitspal
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
    console.log('📝 Please edit server/.env with your configuration');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🚀 Next steps:');
console.log('1. Install dependencies: npm run install-all');
console.log('2. Set up MongoDB (local or MongoDB Atlas)');
console.log('3. Create a Cloudinary account for video storage');
console.log('4. Update server/.env with your credentials');
console.log('5. Start development: npm run dev');
console.log('\n📚 See README.md for detailed setup instructions');
console.log('\n🥋 Welcome to JitsPal!');



