const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  answer: {
    type: String,
    required: true
  },
  questionId: {
    type: String,
    required: true
  }
});

const spacedRepetitionSchema = new mongoose.Schema({
  nextReview: {
    type: Date,
    default: Date.now
  },
  easiness: {
    type: Number,
    default: 2.5,
    min: 1.3,
    max: 2.5
  },
  interval: {
    type: Number,
    default: 1
  },
  repetitions: {
    type: Number,
    default: 0
  },
  lastReviewed: {
    type: Date,
    default: Date.now
  }
});

const quizSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['flashcard', 'mcq', 'fill-in-the-blank'],
    required: true
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  spacedRepetition: {
    type: spacedRepetitionSchema,
    default: () => ({})
  },
  history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSession'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

// Pre-save hook to ensure spacedRepetition is always set
quizSchema.pre('save', function(next) {
  if (!this.spacedRepetition) {
    this.spacedRepetition = {};
  }
  next();
});

// Index for spaced repetition queries
quizSchema.index({ userId: 1, 'spacedRepetition.nextReview': 1 });
quizSchema.index({ noteId: 1 });

// Method to update spaced repetition based on performance
quizSchema.methods.updateSpacedRepetition = function(rating) {
  // FULLPROOF: Always initialize spacedRepetition if missing (for legacy quizzes)
  if (!this.spacedRepetition || typeof this.spacedRepetition !== 'object' || this.spacedRepetition.easiness === undefined) {
    console.warn('[Quiz.updateSpacedRepetition] Patch: spacedRepetition missing or incomplete for quiz', this._id, this.spacedRepetition);
    this.spacedRepetition = {
      easiness: 2.5,
      interval: 1,
      repetitions: 0,
      lastReviewed: new Date(),
      nextReview: new Date()
    };
  }
  const sr = this.spacedRepetition;
  
  // SM2 Algorithm implementation
  if (rating >= 3) { // Easy
    sr.easiness = Math.max(1.3, sr.easiness + 0.1);
    sr.repetitions += 1;
    sr.interval = sr.repetitions === 1 ? 1 : Math.round(sr.interval * sr.easiness);
  } else if (rating === 2) { // Medium
    sr.easiness = Math.max(1.3, sr.easiness - 0.15);
    sr.repetitions = 0;
    sr.interval = 1;
  } else { // Hard
    sr.easiness = Math.max(1.3, sr.easiness - 0.2);
    sr.repetitions = 0;
    sr.interval = 1;
  }
  
  sr.lastReviewed = new Date();
  sr.nextReview = new Date(Date.now() + sr.interval * 24 * 60 * 60 * 1000); // Convert days to milliseconds
  
  return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema); 