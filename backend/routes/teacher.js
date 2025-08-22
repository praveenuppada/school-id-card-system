const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { verifyToken, requireTeacher } = require('../middleware/auth');
const Student = require('../models/Student');
const School = require('../models/School');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads with larger size limit for high quality images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB for high quality images
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
    // Fetch the actual school name from the database
    let schoolName = 'School Dashboard';
    if (req.user.schoolId) {
      const school = await School.findById(req.user.schoolId);
      if (school) {
        schoolName = school.name;
      }
    }

    const profile = {
      username: req.user.username,
      schoolId: req.user.schoolId,
      role: req.user.role,
      schoolName: schoolName
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

// Get school information for current teacher
router.get('/school-info', async (req, res) => {
  try {
    let schoolInfo = {
      schoolName: 'School Dashboard',
      schoolId: req.user.schoolId
    };

    if (req.user.schoolId) {
      const school = await School.findById(req.user.schoolId);
      if (school) {
        schoolInfo = {
          schoolName: school.name,
          schoolId: school._id,
          address: school.address,
          contactPerson: school.contactPerson,
          contactEmail: school.contactEmail,
          contactPhone: school.contactPhone,
          principalName: school.principalName,
          totalStudents: school.totalStudents,
          establishedYear: school.establishedYear
        };
      }
    }

    res.json({
      success: true,
      ...schoolInfo
    });
  } catch (error) {
    console.error('School info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get school info: ' + error.message
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

    console.log(`📊 Returning ${students.length} students for class: ${className}`);
    if (students.length > 0) {
      console.log(`📊 First student fields:`, Object.keys(students[0].toObject()));
      console.log(`📊 First student photoUrl:`, students[0].photoUrl);
      console.log(`📊 First student photoUploaded:`, students[0].photoUploaded);
    }

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

// Upload photo
router.post('/upload-photo', upload.single('file'), async (req, res) => {
  try {
    const { studentId, photoId } = req.body
    const file = req.file

    console.log('📸 Photo upload request received:')
    console.log('  - studentId:', studentId)
    console.log('  - photoId:', photoId)
    console.log('  - file size:', file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'No file')

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    if (!studentId || !photoId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Photo ID are required'
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    console.log(`✅ Found student: ${student.fullName} (PhotoID: ${student.photoId})`)

    // Generate unique photo ID for Cloudinary
    const uniquePhotoId = `${student._id}_${Date.now()}`

    // Upload to Cloudinary with MAXIMUM quality preservation
    console.log('☁️ Uploading to Cloudinary with maximum quality...')
    const uploadResult = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        public_id: `student_photos/${uniquePhotoId}`,
        overwrite: true,
        quality: 'auto:best', // Maximum quality preservation
        fetch_format: 'auto', // Preserve original format
        flags: 'preserve_transparency', // Preserve transparency if any
        transformation: [
          { quality: 'auto:best' }, // Ensure best quality
          { fetch_format: 'auto' }, // Preserve original format
          { flags: 'preserve_transparency' } // Preserve transparency
        ],
        // Additional quality settings for maximum preservation
        eager: [
          { quality: 'auto:best', fetch_format: 'auto' }
        ],
        eager_async: true,
        eager_notification_url: null
      }
    )

    console.log(`✅ Cloudinary upload successful: ${uploadResult.secure_url}`)
    console.log(`📊 File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

    // Update student record with high-quality URL
    const updateResult = await Student.updateOne(
      { _id: studentId },
      {
        photoUrl: uploadResult.secure_url,
        photoUrlHighQuality: uploadResult.secure_url, // Store high-quality version
        photoUploaded: true,
        updatedBy: req.user.username,
        updatedAt: new Date()
      }
    )

    console.log(`✅ Database updated successfully for student: ${student.fullName}`)

    res.json({
      success: true,
      message: 'Photo uploaded successfully with maximum quality',
      photoUrl: uploadResult.secure_url,
      photoUrlHighQuality: uploadResult.secure_url,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    })

  } catch (error) {
    console.error('❌ Photo upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo: ' + error.message
    })
  }
})

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
