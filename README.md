# 🧠 NeuroRecall

**NeuroRecall** is a modern, AI-powered learning optimization platform with a beautiful SaaS UI. Users can upload learning materials, generate quizzes with AI, and retain knowledge using spaced repetition. The app features performance analytics, Huberman-style brain tips, and gamification to boost engagement.

---

## 🚀 Features

### ✅ **Current**
- **Modern SaaS UI**: Glassmorphic cards, gradients, Sora/Inter fonts, and accent color coding throughout
- **User Authentication**: Secure signup/login with JWT tokens
- **Note Upload**: Upload and manage learning materials (PDF, text, markdown, or direct input)
- **Dashboard**: Animated XP bar, glowing streak flame, and rank badge
- **Gamification**: XP system, ranks, and streaks
- **Brain Optimization Tips**: 🧬 emoji, actionable neuroscience-based tips, beautiful pop-up
- **Quiz Generation**: AI-powered flashcards, MCQ, and fill-in-the-blank quizzes
- **Spaced Repetition**: SM2 algorithm for optimal review scheduling
- **Quiz & Review UI**: Glassy cards, accent gradients, pill buttons, and smooth animations
- **Responsive Design**: Fully mobile-friendly
- **Database Models**: Complete MongoDB schema for all features

### 🚧 **In Development**
- Advanced analytics dashboard
- Collaborative learning
- Mobile app (React Native/Expo)

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Tailwind CSS + React Router (Sora/Inter fonts, glassmorphism, gradients)
- **Backend**: Node.js + Express + MongoDB (Atlas)
- **Authentication**: JWT + bcrypt
- **Database**: MongoDB Atlas with Mongoose ODM
- **Styling**: Tailwind CSS (with plugins and custom themes)
- **Deployment**: Vercel (frontend), Render (backend)

---

## 📁 Project Structure

```
neuro-recall/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── app.js           # Main server file
│   ├── tests/               # Backend tests
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Helper functions
│   │   ├── styles/          # CSS files
│   │   └── App.jsx          # Main app component
│   ├── public/              # Static files
│   └── package.json
├── docs/                    # Documentation
│   └── context.md           # Project context
└── README.md
```

---

## 🧠 UI/UX Highlights
- **Glassmorphic Cards**: All main sections use glassy, blurred backgrounds with accent borders and shadows
- **Accent Gradients**: Headings, numbers, and buttons use beautiful accent gradients
- **Sora/Inter Fonts**: Sora for headings, Inter for body for a premium SaaS feel
- **Animated XP Bar**: Shows progress toward next rank
- **Streak & Rank**: Glowing flame and badge, always visible in the navbar
- **Brain Tips**: 🧬 emoji, Sora font, and improved pop-up for actionable tips
- **Quiz/Review**: Glassy cards, pill buttons, and smooth transitions

---

## 🔁 Spaced Repetition (SM2 Algorithm)

NeuroRecall uses a neuroscience-backed spaced repetition system to help you remember more, for longer. Each quiz is scheduled for review using the SM2 algorithm (the same method used by Anki):

- **Adaptive Scheduling:** Questions you find easy are shown less often, while harder ones are reviewed more frequently.
- **Personalized Intervals:** After each quiz, you rate the difficulty (Easy, Medium, Hard). The system updates the next review date based on your performance.
- **Automatic Review Buckets:** Quizzes are grouped into Today, Due Soon, and Later, so you always know what to focus on.
- **Streaks & XP:** Completing reviews daily increases your streak and XP, gamifying your learning journey.

**Technical Note:**
- The SM2 algorithm tracks each quiz’s easiness factor, interval, and repetitions. Your feedback directly influences the review schedule for maximum retention.

---

## 📊 Database Schema
- **User**: Email, password hash, XP, rank, streak, settings
- **Note**: User association, content, tags, quizzes
- **Quiz**: Linked to note/user, spaced repetition data, questions, history
- **QuizSession**: User quiz attempts, answer tracking, performance
- **Tip**: Brain optimization tips, per user, per day

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd neuro-recall
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the backend directory:
```
PORT=5001
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-key
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:5001/api
```

Start the frontend development server:
```bash
npm start
```

---

## 🚀 Deployment

### Backend Deployment (Render)

1. Push your code to GitHub
2. Sign up for [Render](https://render.com/)
3. Create a new Web Service and connect your GitHub repository
4. Configure the build settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add the following environment variables:
   - `PORT`: 10000 (or any port Render allows)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `OPENAI_API_KEY`: Your OpenAI API key
6. Deploy

Detailed deployment instructions are available in [docs/render-deployment.md](docs/render-deployment.md).

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Sign up for [Vercel](https://vercel.com/)
3. Import your repository
4. Configure the build settings:
   - **Framework Preset**: Create React App
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
5. Add the following environment variable:
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., https://neuro-recall-backend.onrender.com/api)
6. Deploy

---

## 📝 .gitignore
```
node_modules/
.env
dist/
build/
.DS_Store
```

---

## 🖼️ Screenshots
- **Landing Page**: Modern SaaS hero, glassmorphic navbar, accent gradients
- **Dashboard**: Glass cards, animated XP bar, streak, rank badge, brain tips pop-up
- **Quiz/Review**: Glassy cards, accent gradients, pill buttons, smooth transitions
- **Auth**: Glassmorphic sign up/login, Sora/Inter fonts, animated labels

---

## 🤝 How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes (UI, backend, docs, etc.)
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ for better learning and a beautiful user experience**
