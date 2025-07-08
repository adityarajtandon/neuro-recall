# 🧠 NeuroRecall — Project Context

**NeuroRecall** is an AI-powered learning optimization platform inspired by neuroscience. Users can upload learning materials, generate quizzes with AI, and retain knowledge using spaced repetition. The app features performance analytics, Huberman-style learning tips, and gamification to boost engagement.

---

## 🚀 App Flow

### 1. Welcome & Authentication
- Clean landing page with email signup/login.
- Successful login redirects to the main learning dashboard.

### 2. Dashboard
- Upload notes as `.pdf`, `.txt`, `.md`, or direct text.
- Uploaded files are listed with:
  - Filename
  - Upload date
  - "Generate Quiz" button

### 3. Quiz Generation
- Click "Generate Quiz" to process note content via OpenAI/DeepSeek.
- Quiz types:
  - Flashcards (Q/A)
  - Multiple Choice (MCQ)
  - Fill-in-the-blanks
- Generated quizzes are stored with the note's metadata.

### 4. Spaced Repetition Engine
- Implements a simplified SM2 algorithm for scheduling reviews.
- Quiz results update difficulty and easiness scores.
- Items are bucketed into:
  - **Today**
  - **Due Soon**
  - **Later**

### 5. Quiz Review UI
- Users see quizzes due for the day.
- Mark answers as:
  - Easy
  - Medium
  - Hard
- Feedback updates future scheduling.

---

## 🏅 Gamification

### XP System
- Earn XP for:
  - Uploading notes
  - Completing quizzes
  - Maintaining a daily streak
- XP unlocks visual ranks (e.g., "Neural Newbie" → "Recall Master").

### Streaks
- Completing at least one quiz per day increases your streak.
- Missing a day resets the streak counter.

### Progress Dashboard
- XP bar
- Streak flame icon
- Total notes uploaded
- Quizzes completed

---

## 📊 Analytics

### Performance Tracking
- Track % correct per quiz.
- Identify most difficult topics/concepts.
- "Cognitive Heatmap" highlights most forgotten areas.

### Session Logs
- Quiz timestamps
- Duration
- Answer ratings (easy/medium/hard)

---

## 🧘‍♂️ Brain Optimization Engine (Huberman-Based)

- Analyzes quiz timing, performance, and breaks to offer science-based tips:
  - "You're best at morning recall — try scheduling quizzes before noon."
  - "You've taken 4 quizzes back to back — consider a 10-min NSDR break."
  - "Nighttime performance dips detected. Shift to earlier slots."
- Tips are based on:
  - Circadian rhythm
  - Deep work intervals
  - Light exposure
  - Sleep/rest impact on memory

---

## 🧱 Tech Stack Reference

- **Frontend:** React + Tailwind (Vercel)
- **Backend:** Node.js + Express (Render/Railway)
- **Database:** MongoDB Atlas
- **AI API:** OpenAI or DeepSeek
- **Optional Mobile:** Expo (if extending)

---

**This document is intended to guide Cursor AI and developers throughout the project lifecycle.**

---

## 🗄️ Database Schema (MongoDB)

### **User**
```json
{
  "_id": ObjectId,
  "email": String,
  "passwordHash": String,
  "createdAt": Date,
  "xp": Number,
  "rank": String,
  "streak": Number,
  "lastActive": Date,
  "settings": {
    "notificationPreferences": Object,
    "theme": String
  }
}
```

### **Note**
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "filename": String,
  "content": String,
  "uploadDate": Date,
  "quizzes": [ObjectId]
}
```

### **Quiz**
```json
{
  "_id": ObjectId,
  "noteId": ObjectId,
  "userId": ObjectId,
  "type": "flashcard" | "mcq" | "fill-in-the-blank",
  "questions": [
    {
      "question": String,
      "options": [String],
      "answer": String
    }
  ],
  "createdAt": Date,
  "spacedRepetition": {
    "nextReview": Date,
    "easiness": Number,
    "interval": Number,
    "repetitions": Number
  },
  "history": [ObjectId]
}
```

### **QuizSession**
```json
{
  "_id": ObjectId,
  "quizId": ObjectId,
  "userId": ObjectId,
  "timestamp": Date,
  "duration": Number,
  "answers": [
    {
      "questionId": String,
      "userAnswer": String,
      "correct": Boolean,
      "rating": "easy" | "medium" | "hard"
    }
  ]
}
```

### **Analytics**
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "date": Date,
  "quizzesCompleted": Number,
  "correctPercent": Number,
  "difficultTopics": [String],
  "cognitiveHeatmap": Object
}
```

### **Tip**
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "tip": String,
  "generatedAt": Date,
  "context": Object
}
```

---

## 📁 Optimal Folder Structure

```
neuro-recall/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── tests/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── mobile/                # (Optional, if using Expo)
│   ├── src/
│   └── App.js
│
├── docs/
│   └── context.md
│
├── .env
├── .gitignore
└── README.md
```
