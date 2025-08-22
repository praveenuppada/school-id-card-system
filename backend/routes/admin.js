const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cloudinary = require('cloudinary').v2;
const { verifyToken, requireAdmin } = require('../middleware/auth');
const School = require('../models/School');
const Student = require('../models/Student');
const User = require('../models/User');

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
  }
});

// Apply authentication middleware to all admin routes
router.use(verifyToken, requireAdmin);

// Register school with teacher account
router.post('/school', async (req, res) => {
  try {
    const {
      schoolName,
      username,
      password,
      schoolAddress,
      contactPerson,
      contactEmail,
      contactPhone,
      principalName,
      totalStudents,
      establishedYear
    } = req.body;

    if (!schoolName || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'School name, username, and password are required'
      });
    }

    // Check if school already exists
    const existingSchool = await School.findOne({ name: schoolName });
    if (existingSchool) {
      return res.status(400).json({
        success: false,
        message: 'School with this name already exists'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create new school
    const school = new School({
      name: schoolName,
      address: schoolAddress,
      contactPerson,
      contactEmail,
      contactPhone,
      principalName,
      totalStudents: parseInt(totalStudents) || 0,
      establishedYear: establishedYear ? parseInt(establishedYear) : undefined
    });

    await school.save();

    // Create teacher user account
    const teacherUser = new User({
      username: username,
      password: password,
      role: 'ROLE_TEACHER',
      schoolId: school._id.toString(),
      email: contactEmail
    });

    await teacherUser.save();

    res.json({
      success: true,
      message: 'School and teacher account registered successfully',
      schoolId: school._id,
      schoolName: school.name,
      username: username
    });

  } catch (error) {
    console.error('School registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register school: ' + error.message
    });
  }
});

// Get all schools
router.get('/schools', async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      schools
    });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schools: ' + error.message
    });
  }
});

// Upload Excel file
router.post('/upload-excel', upload.single('file'), async (req, res) => {
  try {
    const { schoolId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required'
      });
    }

    // Get school name
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Parse Excel file
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const students = [];

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip header row and process data
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[1]) { // Check if photoId and fullName exist
          const student = new Student({
            photoId: String(row[0]).trim(),
            fullName: String(row[1]).trim(),
            className: sheetName,
            schoolId: schoolId,
            schoolName: school.name,
            photoUploaded: false
          });
          students.push(student);
        }
      }
    }

    // Save students to database
    if (students.length > 0) {
      await Student.insertMany(students);
    }

    res.json({
      success: true,
      message: 'Excel uploaded successfully',
      totalStudents: students.length
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload Excel: ' + error.message
    });
  }
});

// Get classes for a school
router.get('/view-classes/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const students = await Student.find({ schoolId });
    
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

// Get students by class (for admin dashboard)
router.get('/students-by-class/:className', async (req, res) => {
  try {
    const { className } = req.params;
    console.log('🔍 Getting students for class:', className);
    
    const students = await Student.find({ className }).sort({ fullName: 1 });
    console.log(`✅ Found ${students.length} students in class ${className}`);
    
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students by class: ' + error.message
    });
  }
});

// Get school data
router.get('/school-data/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    console.log('🔍 Getting school data for schoolId:', schoolId);
    
    const school = await School.findById(schoolId);
    console.log('🏫 Found school:', school ? school.name : 'Not found');
    
    if (!school) {
      console.log('❌ School not found with ID:', schoolId);
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const students = await Student.find({ schoolId });
    const updatedStudents = students.filter(s => s.photoUploaded);
    
    // Get unique classes from students
    const classes = [...new Set(students.map(s => s.className))].sort();

    const schoolData = {
      schoolInfo: {
        id: school._id,
        name: school.name,
        totalStudents: students.length,
        classes: classes
      },
      originalExcel: students,
      teacherUpdates: updatedStudents
    };

    res.json({
      success: true,
      data: schoolData
    });

  } catch (error) {
    console.error('Get school data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get school data: ' + error.message
    });
  }
});

// Delete Excel data for a school
router.delete('/delete-excel/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const students = await Student.find({ schoolId });
    if (students.length === 0) {
      return res.json({
        success: true,
        message: 'No students found for this school',
        deletedCount: 0
      });
    }

    await Student.deleteMany({ schoolId });

    res.json({
      success: true,
      message: `Successfully deleted ${students.length} student records`,
      deletedCount: students.length
    });

  } catch (error) {
    console.error('Delete Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Excel data: ' + error.message
    });
  }
});

// Delete photos for a school
router.delete('/delete-photos/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const students = await Student.find({ schoolId, photoUploaded: true });
    if (students.length === 0) {
      return res.json({
        success: true,
        message: 'No photos found for this school',
        deletedCount: 0
      });
    }

    // Delete photos from Cloudinary
    for (const student of students) {
      if (student.photoUrl) {
        try {
          const publicId = `student_photos/${student.photoId}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.log(`Failed to delete photo from Cloudinary for ${student.photoId}:`, cloudinaryError.message);
        }
      }
    }

    // Reset photo fields in database
    await Student.updateMany(
      { schoolId },
      { 
        $unset: { photoUrl: 1, photoUploaded: 1, updatedBy: 1, updatedAt: 1 }
      }
    );

    res.json({
      success: true,
      message: `Successfully deleted ${students.length} photos`,
      deletedCount: students.length
    });

  } catch (error) {
    console.error('Delete photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photos: ' + error.message
    });
  }
});

// Delete school with all associated data
router.delete('/delete-school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    console.log(`🗑️ Delete school request for schoolId: ${schoolId}`);
    
    // Find school
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    console.log(`✅ Found school: ${school.name} (ID: ${school._id})`);

    // Get all students for this school in one query
    const students = await Student.find({ schoolId }).select('photoId photoUrl');
    console.log(`📊 Found ${students.length} students to delete`);

    // Bulk delete operations for faster performance
    const deletePromises = [];

    // Delete photos from Cloudinary in parallel (non-blocking)
    if (students.length > 0) {
      const cloudinaryDeletes = students.map(async (student) => {
        if (student.photoUrl) {
          try {
            const publicId = `student_photos/${student.photoId}`;
            await cloudinary.uploader.destroy(publicId);
            console.log(`✅ Deleted photo from Cloudinary: ${student.photoId}`);
          } catch (cloudinaryError) {
            console.log(`⚠️ Failed to delete photo from Cloudinary for ${student.photoId}:`, cloudinaryError.message);
          }
        }
      });
      
      // Don't wait for Cloudinary deletes to complete
      Promise.allSettled(cloudinaryDeletes);
    }

    // Bulk delete students
    deletePromises.push(Student.deleteMany({ schoolId }));
    
    // Bulk delete teachers
    deletePromises.push(User.deleteMany({ schoolId, role: 'ROLE_TEACHER' }));
    
    // Delete the school
    deletePromises.push(School.findByIdAndDelete(schoolId));

    // Execute all deletes in parallel
    await Promise.all(deletePromises);

    console.log(`✅ Successfully deleted school: ${school.name}`);

    res.json({
      success: true,
      message: `Successfully deleted school "${school.name}" with all associated data`,
      deletedCount: {
        students: students.length,
        teachers: 0 // Will be updated if needed
      }
    });

  } catch (error) {
    console.error('❌ Delete school error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete school: ' + error.message
    });
  }
});

// Download Excel for a school
router.get('/download-excel/:schoolName', async (req, res) => {
  try {
    const { schoolName } = req.params;
    
    // Find school by name
    const school = await School.findOne({ name: schoolName });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Get all students for this school
    const students = await Student.find({ schoolId: school._id });
    
    // Create Excel workbook
    const workbook = xlsx.utils.book_new();
    
    // Group students by class
    const studentsByClass = {};
    students.forEach(student => {
      if (!studentsByClass[student.className]) {
        studentsByClass[student.className] = [];
      }
      studentsByClass[student.className].push({
        'Photo ID': student.photoId,
        'Full Name': student.fullName,
        'Class': student.className,
        'Photo Uploaded': student.photoUploaded ? 'Yes' : 'No',
        'Photo URL': student.photoUrl || '',
        'Updated By': student.updatedBy || '',
        'Updated At': student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : '',
        'Created At': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : ''
      });
    });

    // Create sheets for each class
    Object.keys(studentsByClass).forEach(className => {
      const worksheet = xlsx.utils.json_to_sheet(studentsByClass[className]);
      xlsx.utils.book_append_sheet(workbook, worksheet, className);
    });

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${schoolName}_students.xlsx"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);

  } catch (error) {
    console.error('Download Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download Excel: ' + error.message
    });
  }
});

// Download photos ZIP for a school
router.get('/download-photos/:schoolName', async (req, res) => {
  try {
    const { schoolName } = req.params;
    console.log(`📦 Download photos request for school: ${schoolName}`);
    
    // Find school by name
    const school = await School.findOne({ name: schoolName });
    if (!school) {
      console.log(`❌ School not found: ${schoolName}`);
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    console.log(`✅ Found school: ${school.name} (ID: ${school._id})`);

    // Get students with photos
    const students = await Student.find({ 
      schoolId: school._id, 
      photoUploaded: true,
      photoUrl: { $exists: true, $ne: null }
    });

    console.log(`📸 Found ${students.length} students with photos for school: ${schoolName}`);

    if (students.length === 0) {
      console.log(`❌ No photos found for school: ${schoolName}`);
      return res.status(404).json({
        success: false,
        message: 'No photos found for this school'
      });
    }

    // Create a ZIP file with all photos
    const JSZip = require('jszip');
    const zip = new JSZip();
    
    console.log(`📦 Creating ZIP file for ${students.length} photos from ${schoolName}`);

    // Download each photo from Cloudinary and add to ZIP
    let successfulDownloads = 0;
    for (const student of students) {
      try {
        console.log(`📥 Downloading photo for: ${student.fullName} (${student.photoId})`);
        
        // Use high quality URL if available, otherwise fall back to regular URL
        const photoUrl = student.photoUrlHighQuality || student.photoUrl;
        console.log(`🔗 Photo URL: ${photoUrl}`);
        console.log(`🎯 Using ${student.photoUrlHighQuality ? 'high quality' : 'regular'} version`);
        
        // Download photo from Cloudinary
        const photoBuffer = await new Promise((resolve, reject) => {
          const https = require('https');
          const request = https.get(photoUrl, (response) => {
            if (response.statusCode !== 200) {
              reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
              return;
            }
            
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
              const buffer = Buffer.concat(chunks);
              console.log(`📦 Downloaded ${buffer.length} bytes for ${student.fullName}`);
              resolve(buffer);
            });
            response.on('error', reject);
          });
          
          request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Download timeout'));
          });
          
          request.on('error', reject);
        });

        // Add to ZIP with photo ID only filename
        const fileName = `${student.photoId}.jpg`;
        zip.file(fileName, photoBuffer);
        
        console.log(`✅ Added photo to ZIP: ${fileName}`);
        successfulDownloads++;
      } catch (photoError) {
        console.error(`❌ Failed to download photo for ${student.fullName}:`, photoError.message);
        // Continue with other photos even if one fails
      }
    }
    
    console.log(`📊 Successfully downloaded ${successfulDownloads} out of ${students.length} photos`);

    if (successfulDownloads === 0) {
      console.log(`❌ No photos were successfully downloaded`);
      return res.status(500).json({
        success: false,
        message: 'Failed to download any photos. Please try again.'
      });
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    console.log(`📦 ZIP file created successfully: ${zipBuffer.length} bytes`);

    // Set headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${schoolName}_photos.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);

    console.log(`📤 Sending ZIP file to client: ${schoolName}_photos.zip`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Download photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download photos: ' + error.message
    });
  }
});

// Crop and upload photo (admin version)
router.post('/crop-photo', upload.single('file'), async (req, res) => {
  try {
    const { photoId, studentId } = req.body;
    const file = req.file;

    console.log('📸 Photo upload request received:');
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

    // Upload to Cloudinary with maximum quality preservation
    const uniquePhotoId = `${student._id}_${Date.now()}`;
    const uploadResult = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        public_id: `student_photos/${uniquePhotoId}`,
        overwrite: true,
        quality: 'auto:best', // Maximum quality
        fetch_format: 'auto', // Preserve original format
        flags: 'preserve_transparency', // Preserve transparency if any
        transformation: [
          { quality: 'auto:best' }, // Ensure best quality
          { fetch_format: 'auto' }  // Preserve original format
        ]
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
      message: 'Photo cropped and uploaded successfully',
      photoUrl: uploadResult.secure_url
    });

  } catch (error) {
    console.error('Crop photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cropping and uploading photo: ' + error.message
    });
  }
});

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalSchools = await School.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalClasses = await Student.distinct('className');
    
    res.json({
      success: true,
      stats: {
        totalSchools,
        totalStudents,
        totalClasses: totalClasses.length
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats: ' + error.message
    });
  }
});

// Get admin notifications
router.get('/notifications', async (req, res) => {
  try {
    // For now, return empty notifications array
    // In a full implementation, you would fetch notifications from a database
    res.json({
      success: true,
      notifications: []
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications: ' + error.message
    });
  }
});

// Mark notification as read
router.post('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // For now, just return success
    // In a full implementation, you would mark the notification as read in the database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read: ' + error.message
    });
  }
});

// Delete single photo for a student
router.delete('/delete-photo/:studentId/:photoId', async (req, res) => {
  try {
    const { studentId, photoId } = req.params;
    
    console.log('Delete photo request:', { studentId, photoId });
    
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      console.log('Student not found:', studentId);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }



    console.log('Student found:', { 
      id: student._id, 
      photoId: student.photoId, 
      photoUrl: student.photoUrl,
      photoUploaded: student.photoUploaded 
    });

    // Check if student has a photo
    if (!student.photoUrl) {
      console.log('No photo URL found for student');
      return res.status(404).json({
        success: false,
        message: 'No photo found for this student'
      });
    }

    // Delete from Cloudinary
    try {
      // Extract public ID from Cloudinary URL
      let publicId = '';
      
      if (student.photoUrl.includes('cloudinary.com')) {
        // Extract public ID from Cloudinary URL
        const urlParts = student.photoUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        publicId = filename.split('.')[0];
        
        // If the URL contains a folder structure, include it
        if (urlParts.length > 7) {
          const folderIndex = urlParts.indexOf('upload') + 1;
          const folder = urlParts[folderIndex];
          if (folder && !folder.includes('.')) {
            publicId = `${folder}/${publicId}`;
          }
        }
      } else {
        // For non-Cloudinary URLs, use photoId as fallback
        publicId = student.photoId;
      }
      
      console.log('Attempting to delete from Cloudinary:', { 
        publicId, 
        photoUrl: student.photoUrl,
        photoId: student.photoId 
      });
      
      if (publicId) {
        const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary delete result:', cloudinaryResult);
      } else {
        console.log('No public ID found, skipping Cloudinary deletion');
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue even if Cloudinary deletion fails
    }

    // Clear photo URL in database
    student.photoUrl = null;
    student.photoUploaded = false;
    await student.save();

    console.log('Photo deleted successfully from database');

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      studentId,
      photoId
    });

  } catch (error) {
    console.error('Delete single photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo: ' + error.message
    });
  }
});

// Delete single photo by photoId (alternative endpoint)
router.delete('/delete-photo-by-id/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    console.log('Delete photo by photoId request:', { photoId });
    
    // Find the student by photoId
    const student = await Student.findOne({ photoId: photoId });
    if (!student) {
      console.log('Student not found by photoId:', photoId);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    console.log('Student found by photoId:', { 
      id: student._id, 
      photoId: student.photoId, 
      photoUrl: student.photoUrl,
      photoUploaded: student.photoUploaded 
    });

    // Check if student has a photo
    if (!student.photoUrl) {
      console.log('No photo URL found for student');
      return res.status(404).json({
        success: false,
        message: 'No photo found for this student'
      });
    }

    // Delete from Cloudinary
    try {
      // Extract public ID from Cloudinary URL
      let publicId = '';
      
      if (student.photoUrl.includes('cloudinary.com')) {
        // Extract public ID from Cloudinary URL
        const urlParts = student.photoUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        publicId = filename.split('.')[0];
        
        // If the URL contains a folder structure, include it
        if (urlParts.length > 7) {
          const folderIndex = urlParts.indexOf('upload') + 1;
          const folder = urlParts[folderIndex];
          if (folder && !folder.includes('.')) {
            publicId = `${folder}/${publicId}`;
          }
        }
      } else {
        // For non-Cloudinary URLs, use photoId as fallback
        publicId = student.photoId;
      }
      
      console.log('Attempting to delete from Cloudinary:', { 
        publicId, 
        photoUrl: student.photoUrl,
        photoId: student.photoId 
      });
      
      if (publicId) {
        const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary delete result:', cloudinaryResult);
      } else {
        console.log('No public ID found, skipping Cloudinary deletion');
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue even if Cloudinary deletion fails
    }

    // Clear photo URL in database
    student.photoUrl = null;
    student.photoUploaded = false;
    await student.save();

    console.log('Photo deleted successfully from database');

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      studentId: student._id,
      photoId
    });

  } catch (error) {
    console.error('Delete single photo by photoId error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo: ' + error.message
    });
  }
});

// Delete all photos for a school
router.delete('/delete-photos/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const students = await Student.find({ schoolId });
    if (students.length === 0) {
      return res.json({
        success: true,
        message: 'No students found for this school',
        deletedCount: 0
      });
    }

    let deletedCount = 0;
    for (const student of students) {
      if (student.photoUrl) {
        try {
          // Extract public ID from Cloudinary URL
          const urlParts = student.photoUrl.split('/');
          const publicId = urlParts[urlParts.length - 1].split('.')[0];
          
          await cloudinary.uploader.destroy(publicId);
          deletedCount++;
        } catch (cloudinaryError) {
          console.error('Cloudinary delete error:', cloudinaryError);
        }
      }
      
      // Clear photo URL in database
      student.photoUrl = null;
      student.photoUploaded = false;
      await student.save();
    }

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} photos`,
      deletedCount
    });

  } catch (error) {
    console.error('Delete photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photos: ' + error.message
    });
  }
});

module.exports = router;
