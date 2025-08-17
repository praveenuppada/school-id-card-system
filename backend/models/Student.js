const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  photoId: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  className: {
    type: String,
    required: true,
    trim: true
  },
  schoolId: {
    type: String,
    required: true
  },
  schoolName: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String,
    trim: true
  },
  photoUploaded: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: String,
    trim: true
  },
  updatedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Additional fields
  rollNumber: {
    type: String,
    trim: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  motherName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
studentSchema.index({ schoolId: 1, className: 1 });
studentSchema.index({ photoId: 1 });

module.exports = mongoose.model('Student', studentSchema);
