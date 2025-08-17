# School ID Card Management System - Backend

A Node.js/Express backend for managing school ID cards with photo uploads, Excel data processing, and role-based access control.

## 🚀 Features

- **Authentication**: JWT-based authentication with role-based access
- **User Management**: Admin and Teacher roles
- **School Management**: Register and manage schools
- **Excel Processing**: Upload and process student data from Excel files
- **Photo Upload**: Upload student photos to Cloudinary
- **MongoDB Integration**: Data persistence with MongoDB Atlas
- **Security**: Rate limiting, CORS, and input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `config.env` and update with your credentials
   - Update MongoDB URI, Cloudinary credentials, and JWT secret

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/create-navodhaya` - Create test teacher user
- `GET /api/auth/check-navodhaya` - Check test user
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/test-encode` - Test password encoding

### Admin Routes (Requires ROLE_ADMIN)
- `POST /api/admin/school` - Register new school
- `GET /api/admin/schools` - Get all schools
- `POST /api/admin/upload-excel` - Upload Excel file
- `GET /api/admin/view-classes/:schoolId` - Get classes for school
- `GET /api/admin/school-data/:schoolId` - Get school data
- `DELETE /api/admin/delete-excel/:schoolId` - Delete Excel data
- `DELETE /api/admin/delete-photos/:schoolId` - Delete all photos

### Teacher Routes (Requires ROLE_TEACHER)
- `GET /api/teacher/profile` - Get teacher profile
- `GET /api/teacher/classes` - Get classes for teacher
- `GET /api/teacher/students` - Get students by class
- `POST /api/teacher/upload-photo` - Upload student photo
- `POST /api/teacher/send-updated` - Submit updates
- `POST /api/teacher/notify-admin` - Send notification to admin

## 🔧 Configuration

### Environment Variables
```env
PORT=8081
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAX_FILE_SIZE=10485760
```

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── School.js
│   └── Student.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── admin.js
│   └── teacher.js
├── server.js
├── package.json
├── config.env
└── README.md
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
- username, password, role, schoolId, email, phoneNumber

### School
- name, address, contactPerson, contactEmail, contactPhone, principalName, totalStudents, establishedYear

### Student
- photoId, fullName, className, schoolId, schoolName, photoUrl, photoUploaded, updatedBy, updatedAt

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Test the API:**
   ```bash
   curl http://localhost:8081/api/health
   ```

4. **Create test user:**
   ```bash
   curl -X POST http://localhost:8081/api/auth/create-navodhaya
   ```

5. **Login:**
   ```bash
   curl -X POST http://localhost:8081/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"navodhaya","password":"navodhaya"}'
   ```

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## 📝 License

MIT License
