const express = require('express');
const Tip = require('../models/Tip');
const { generateBrainTips } = require('../services/tips');
const auth = require('../middleware/auth');

const router = express.Router();

// Get today's tips for the user
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find tips generated today
    let tips = await Tip.find({
      userId: req.user.userId,
      generatedAt: { $gte: today }
    }).sort({ generatedAt: 1 });

    if (tips.length === 0) {
      // Only generate if there are none for today
      tips = await generateBrainTips(req.user.userId);
    }

    // Always return at most 3 tips
    res.json({ tips: tips.slice(0, 3) });
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({ message: 'Failed to get tips' });
  }
});

module.exports = router; 