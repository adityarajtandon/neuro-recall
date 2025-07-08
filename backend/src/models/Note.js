const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  fileType: {
    type: String,
    enum: ['pdf', 'txt', 'md', 'text'],
    default: 'text'
  },
  fileSize: {
    type: Number
  },
  tags: [{
    type: String,
    trim: true
  }]
});

// Index for faster queries
noteSchema.index({ userId: 1, uploadDate: -1 });

module.exports = mongoose.model('Note', noteSchema); 