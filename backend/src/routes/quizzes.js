const express = require('express');
const Quiz = require('../models/Quiz');
const QuizSession = require('../models/QuizSession');
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all quizzes for a user (for dashboard)
router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.userId, isActive: true })
      .populate('noteId', 'filename')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific quiz by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    }).populate('noteId', 'filename');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quizzes due for review today (spaced repetition)
router.get('/due/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueQuizzes = await Quiz.find({
      userId: req.user.userId,
      isActive: true,
      'spacedRepetition.nextReview': {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('noteId', 'filename');

    res.json(dueQuizzes);
  } catch (error) {
    console.error('Get due quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quizzes due soon (next 3 days)
router.get('/due/soon', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const soonQuizzes = await Quiz.find({
      userId: req.user.userId,
      isActive: true,
      'spacedRepetition.nextReview': {
        $gte: today,
        $lt: threeDaysFromNow
      }
    }).populate('noteId', 'filename');

    res.json(soonQuizzes);
  } catch (error) {
    console.error('Get soon quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz results and update spaced repetition
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, duration = 0 } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    const quiz = await Quiz.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate results
    let correctAnswers = 0;
    const processedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q.questionId === answer.questionId);
      const isCorrect = question && answer.userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
      
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        correct: isCorrect,
        rating: answer.rating || 'medium',
        timeSpent: answer.timeSpent || 0
      };
    });

    const accuracy = (correctAnswers / quiz.questions.length) * 100;

    // Create quiz session
    const quizSession = new QuizSession({
      quizId: quiz._id,
      userId: req.user.userId,
      duration,
      answers: processedAnswers,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      accuracy
    });

    await quizSession.save();

    // Update quiz history
    quiz.history.push(quizSession._id);
    await quiz.save();

    // Update spaced repetition based on average rating
    const averageRating = processedAnswers.reduce((sum, answer) => {
      const ratingValue = answer.rating === 'easy' ? 3 : answer.rating === 'medium' ? 2 : 1;
      return sum + ratingValue;
    }, 0) / processedAnswers.length;

    await quiz.updateSpacedRepetition(averageRating);

    // Add XP for completing quiz
    const user = await User.findById(req.user.userId);
    const xpGained = Math.floor(accuracy / 10) + 5; // Base 5 XP + bonus based on accuracy
    await user.addXP(xpGained);

    // Update streak if this is the first quiz of the day
    const lastActive = new Date(user.lastActive);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);

    if (lastActive.getTime() < today.getTime()) {
      user.streak += 1;
      user.lastActive = new Date();
      await user.save();
    }

    res.json({
      message: 'Quiz submitted successfully',
      session: quizSession,
      xpGained,
      newStreak: user.streak,
      nextReview: quiz.spacedRepetition.nextReview
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz statistics for a specific quiz
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const sessions = await QuizSession.find({ quizId: quiz._id })
      .sort({ timestamp: -1 })
      .limit(10);

    const stats = {
      totalSessions: sessions.length,
      averageAccuracy: sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + session.accuracy, 0) / sessions.length 
        : 0,
      lastReviewed: quiz.spacedRepetition.lastReviewed,
      nextReview: quiz.spacedRepetition.nextReview,
      easiness: quiz.spacedRepetition.easiness,
      interval: quiz.spacedRepetition.interval,
      repetitions: quiz.spacedRepetition.repetitions,
      recentSessions: sessions
    };

    res.json(stats);
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate a quiz (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isActive: false },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deactivated successfully' });
  } catch (error) {
    console.error('Deactivate quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 