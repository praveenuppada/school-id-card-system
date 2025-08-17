const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { verifyToken, requireTeacher } = require('../middleware/auth');
const Student = require('../models/Student');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply authentication middleware to all teacher routes
router.use(verifyToken, requireTeacher);

// Get teacher profile
router.get('/profile', async (req, res) => {
  try {
    const profile = {
      username: req.user.username,
      schoolId: req.user.schoolId,
      role: req.user.role,
      schoolName: 'Teacher\'s School' // You can enhance this to get actual school name
    };

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile: ' + error.message
    });
  }
});

// Get classes for current teacher
router.get('/classes', async (req, res) => {
  try {
    const students = await Student.find({ schoolId: req.user.schoolId });
    const classes = [...new Set(students.map(s => s.className))].sort();

    res.json({
      success: true,
      classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get classes: ' + error.message
    });
  }
});

// Get students by class
router.get('/students', async (req, res) => {
  try {
    const { className } = req.query;
    
    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required'
      });
    }

    const students = await Student.find({
      schoolId: req.user.schoolId,
      className: className
    }).sort({ fullName: 1 });

    res.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students: ' + error.message
    });
  }
});

// Upload student photo
router.post('/upload-photo', upload.single('file'), async (req, res) => {
  try {
    const { photoId, studentId } = req.body;
    const file = req.file;

    console.log('📸 Teacher photo upload request received:');
    console.log('  - photoId:', photoId);
    console.log('  - studentId:', studentId);
    console.log('  - file size:', file ? file.size : 'No file');

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!photoId) {
      return res.status(400).json({
        success: false,
        message: 'Photo ID is required'
      });
    }

    // CRITICAL FIX: Use studentId as the primary identifier
    let student = null;
    
    if (studentId) {
      // Find by student ID first - this is the most reliable way
      student = await Student.findById(studentId);
      if (student) {
        console.log(`✅ Found student by ID: ${studentId}`);
        console.log(`  - Name: ${student.fullName}`);
        console.log(`  - PhotoId: ${student.photoId}`);
        console.log(`  - Expected PhotoId: ${photoId}`);
        
        // Verify the photoId matches (optional check)
        if (student.photoId !== photoId) {
          console.log(`⚠️ PhotoId mismatch! Student has ${student.photoId}, but request has ${photoId}`);
          console.log(`🔧 Continuing anyway since we have the correct studentId`);
        }
      } else {
        console.log(`❌ Student not found with ID: ${studentId}`);
        return res.status(404).json({
          success: false,
          message: 'Student not found with ID: ' + studentId
        });
      }
    } else {
      // Fallback: find by photoId (less reliable)
      const studentsWithPhotoId = await Student.find({ photoId });
      console.log(`🔍 Found ${studentsWithPhotoId.length} students with photoId: ${photoId}`);
      
      if (studentsWithPhotoId.length === 1) {
        student = studentsWithPhotoId[0];
        console.log(`✅ Found single student with photoId: ${photoId}`);
      } else if (studentsWithPhotoId.length > 1) {
        // Multiple students with same photoId - this is the problem!
        console.log(`⚠️ WARNING: Multiple students found with photoId: ${photoId}`);
        console.log(`📋 Students found:`);
        studentsWithPhotoId.forEach((s, index) => {
          console.log(`  ${index + 1}. ID: ${s._id}, Name: ${s.fullName}, PhotoId: ${s.photoId}`);
        });
        
        // Return error instead of using first one
        return res.status(400).json({
          success: false,
          message: `Multiple students found with photoId: ${photoId}. Please use studentId to specify the correct student.`
        });
      } else {
        // Try to find by ID (in case photoId is actually the student ID)
        student = await Student.findById(photoId);
        if (student) {
          console.log(`✅ Found student by photoId as ID: ${photoId}`);
        } else {
          console.log(`❌ No student found with photoId: ${photoId}`);
          return res.status(404).json({
            success: false,
            message: 'Student not found with photoId: ' + photoId
          });
        }
      }
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    console.log(`🎯 FINAL: Updating student: ${student.fullName} (ID: ${student._id}, PhotoID: ${student.photoId})`);

    // Upload to Cloudinary with a unique identifier using student ID
    const uniquePhotoId = `${student._id}_${Date.now()}`;
    const uploadResult = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        public_id: `student_photos/${uniquePhotoId}`,
        overwrite: true
      }
    );

    // Update ONLY this specific student record
    const updateResult = await Student.findByIdAndUpdate(
      student._id,
      {
        photoUrl: uploadResult.secure_url,
        photoUploaded: true,
        updatedBy: req.user.username,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`✅ Successfully updated photo for student: ${updateResult.fullName}`);
    console.log(`📸 Photo URL: ${uploadResult.secure_url}`);

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: uploadResult.secure_url
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo: ' + error.message
    });
  }
});

// Submit updates
router.post('/send-updated', async (req, res) => {
  try {
    const updatedStudents = await Student.find({
      schoolId: req.user.schoolId,
      photoUploaded: true,
      updatedBy: req.user.username
    });

    res.json({
      success: true,
      message: `Successfully submitted ${updatedStudents.length} student records`,
      submittedCount: updatedStudents.length,
      submittedAt: new Date()
    });

  } catch (error) {
    console.error('Submit updates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit updates: ' + error.message
    });
  }
});

// Notify admin
router.post('/notify-admin', async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // For now, just log the notification
    // You can implement actual notification system later
    console.log('📢 Teacher notification to admin:', {
      title,
      message,
      type,
      teacher: req.user.username,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Notification sent to admin'
    });

  } catch (error) {
    console.error('Notify admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification: ' + error.message
    });
  }
});

module.exports = router;
