const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  correct: {
    type: Boolean,
    required: true
  },
  rating: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

const quizSessionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  answers: [answerSchema],
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number, // percentage
    required: true
  }
});

// Index for performance queries
quizSessionSchema.index({ userId: 1, timestamp: -1 });
quizSessionSchema.index({ quizId: 1, timestamp: -1 });

module.exports = mongoose.model('QuizSession', quizSessionSchema); 