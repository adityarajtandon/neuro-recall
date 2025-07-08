const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tip: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  context: {
    type: Object
  }
});

module.exports = mongoose.model('Tip', tipSchema); 