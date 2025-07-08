const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  xp: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    default: 'Neural Newbie',
    enum: ['Neural Newbie', 'Memory Maven', 'Recall Rookie', 'Brain Builder', 'Recall Master']
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  settings: {
    notificationPreferences: {
      type: Object,
      default: {
        email: true,
        push: false
      }
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark']
    }
  }
});

// Update rank based on XP
userSchema.methods.updateRank = function() {
  if (this.xp >= 1000) this.rank = 'Recall Master';
  else if (this.xp >= 750) this.rank = 'Brain Builder';
  else if (this.xp >= 500) this.rank = 'Recall Rookie';
  else if (this.xp >= 250) this.rank = 'Memory Maven';
  else this.rank = 'Neural Newbie';
};

// Add XP and update rank
userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  this.updateRank();
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 