# 🏫 School ID Card Management System

A comprehensive web application for managing school ID cards, student photos, and administrative tasks. Built with React, Node.js, and MongoDB.

## ✨ Features

### 👨‍💼 Admin Features
- **School Management**: Register and manage multiple schools
- **Excel Upload**: Bulk import student data via Excel files
- **Photo Management**: Upload and crop student photos
- **Data Export**: Download Excel reports and photo ZIP files
- **User Management**: Create and manage teacher accounts
- **Dashboard Analytics**: View total schools, students, and classes

### 👩‍🏫 Teacher Features
- **Student Management**: View and manage class students
- **Photo Upload**: Upload and crop individual student photos
- **Data Submission**: Submit updated student records
- **Profile Management**: Update personal information

### 🔒 Security Features
- **JWT Authentication**: Secure login system
- **Role-based Access**: Admin and Teacher roles
- **Password Hashing**: BCrypt encryption
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API request throttling

## 🛠️ Technology Stack

### Frontend
- **React 18** - User interface
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Webcam** - Camera integration
- **React Image Crop** - Photo cropping

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **BCrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage
- **XLSX** - Excel file processing
- **JSZip** - ZIP file creation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/school-id-card-system.git
cd school-id-card-system
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Environment Setup**
```bash
# Backend environment variables
cd backend
cp .env.example .env
# Edit .env with your credentials
```

4. **Start development servers**
```bash
# Start backend (in backend directory)
cd backend
npm run dev

# Start frontend (in root directory)
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5175
- Backend: http://localhost:8081

## 📁 Project Structure

```
school-id-card-system/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── context/           # React context
│   └── App.jsx            # Main app component
├── backend/               # Backend source code
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   └── server.js          # Server entry point
├── public/                # Static assets
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=8081
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:5175
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8081
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Admin Routes
- `POST /api/admin/school` - Register school
- `GET /api/admin/schools` - Get all schools
- `POST /api/admin/upload-excel` - Upload Excel file
- `GET /api/admin/download-excel/:schoolName` - Download Excel
- `GET /api/admin/download-photos/:schoolName` - Download photos ZIP
- `DELETE /api/admin/delete-school/:schoolId` - Delete school

### Teacher Routes
- `GET /api/teacher/profile` - Get teacher profile
- `GET /api/teacher/classes` - Get teacher classes
- `POST /api/teacher/upload-photo` - Upload student photo

## 🎯 Usage

### Admin Workflow
1. **Login** with admin credentials
2. **Register** a new school
3. **Upload** Excel file with student data
4. **Manage** teachers and assign to schools
5. **Monitor** photo upload progress
6. **Download** reports and photos

### Teacher Workflow
1. **Login** with teacher credentials
2. **Select** class to manage
3. **Upload** photos for students
4. **Submit** updated records
5. **View** progress and status

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deployment
```bash
# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

## 🔒 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Data Protection**: Password hashing with BCrypt
- **File Upload**: Secure file handling with validation
- **CORS**: Configured for production domains
- **Rate Limiting**: API request throttling

## 📱 Mobile Compatibility

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

#### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
```

### Code Style
- ESLint configuration included
- Prettier formatting
- Consistent naming conventions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting guide](./DEPLOYMENT_GUIDE.md#troubleshooting)
2. Review the error logs
3. Verify environment variables
4. Contact support if needed

## 🎉 Acknowledgments

- **React Team** - For the amazing framework
- **Vite Team** - For the fast build tool
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For the flexible database
- **Cloudinary** - For image storage and management

---

**Made with ❤️ for educational institutions**
