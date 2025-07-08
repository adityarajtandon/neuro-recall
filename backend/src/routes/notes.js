const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');

const router = express.Router();

require('../models/Quiz');

// Get all notes for a user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId })
      .sort({ uploadDate: -1 })
      .populate('quizzes', 'type createdAt');

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload a new note
router.post('/', auth, async (req, res) => {
  try {
    const { filename, content, fileType = 'text', tags = [] } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ message: 'Filename and content are required' });
    }

    const note = new Note({
      userId: req.user.userId,
      filename,
      content,
      fileType,
      tags,
      fileSize: content.length
    });

    await note.save();

    // Add XP for uploading note
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    await user.addXP(10);

    res.status(201).json({
      message: 'Note uploaded successfully',
      note,
      xpGained: 10
    });

  } catch (error) {
    console.error('Upload note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('quizzes');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
  try {
    const { filename, content, tags } = req.body;

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      {
        filename,
        content,
        tags,
        fileSize: content ? content.length : undefined
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note updated successfully', note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate Quiz from Note
router.post('/:id/generate-quiz', auth, async (req, res) => {
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { type = 'flashcard' } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Prompt engineering for different quiz types
    let prompt = '';
    if (type === 'flashcard') {
      prompt = `Generate 1 flashcard-style Q&A pair from the following note. Return ONLY a JSON array: [{"question": "...", "answer": "..."}]. No explanation or extra text.\nNote:\n${note.content}`;
    } else if (type === 'mcq') {
      prompt = `Generate 1 multiple choice question (MCQ) from the following note. It should have 1 correct answer and 3 plausible distractors. Return ONLY a JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "..."}]. No explanation or extra text.\nNote:\n${note.content}`;
    } else if (type === 'fill-in-the-blank') {
      prompt = `Generate 1 fill-in-the-blank question from the following note. It should have a sentence with a blank and the correct answer. Return ONLY a JSON array: [{"question": "...", "answer": "..."}]. No explanation or extra text.\nNote:\n${note.content}`;
    } else {
      return res.status(400).json({ message: 'Invalid quiz type' });
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert quiz generator for students.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // Log the raw OpenAI response for debugging
    console.log('OpenAI raw response:', completion.choices[0].message.content);

    // Parse response
    let questions = [];
    try {
      let text = completion.choices[0].message.content.trim();
      // Remove Markdown code block if present
      if (text.startsWith('```')) {
        text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
      }
      questions = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to parse OpenAI response', raw: completion.choices[0].message.content });
    }

    // Normalize questions for MCQ
    if (type === 'mcq') {
      questions = questions.map((q, i) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        questionId: `q${i+1}`
      }));
    } else {
      questions = questions.map((q, i) => ({
        question: q.question,
        options: [],
        answer: q.answer,
        questionId: `q${i+1}`
      }));
    }

    // Create and save quiz
    const quiz = new Quiz({
      noteId: note._id,
      userId: req.user.userId,
      type,
      questions
    });
    await quiz.save();

    // Link quiz to note
    note.quizzes.push(quiz._id);
    await note.save();

    res.status(201).json({ message: 'Quiz generated', quiz, quizId: quiz._id });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Quiz generation failed', error: error.message });
  }
});

// Fetch a quiz by its ID (moved to quizzes routes)
// This endpoint is now handled by /api/quizzes/:id

module.exports = router; 