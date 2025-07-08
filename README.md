# 🧠 NeuroRecall

**NeuroRecall** is an AI-powered learning optimization platform inspired by neuroscience. Users can upload learning materials, generate quizzes with AI, and retain knowledge using spaced repetition. The app features performance analytics, Huberman-style learning tips, and gamification to boost engagement.

## 🚀 Features

### ✅ **Implemented**
- **User Authentication**: Secure signup/login with JWT tokens
- **Note Upload**: Upload and manage learning materials
- **Dashboard**: Clean interface for note management
- **Gamification**: XP system, ranks, and streaks
- **Responsive Design**: Modern UI with Tailwind CSS
- **Database Models**: Complete MongoDB schema for all features

### 🚧 **In Development**
- AI Quiz Generation (OpenAI/DeepSeek integration)
- Spaced Repetition Engine (SM2 algorithm)
- Quiz Interface and Review System
- Analytics Dashboard
- Brain Optimization Tips

## 🛠️ Tech Stack

- **Frontend**: React 18 + Tailwind CSS + React Router
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT + bcrypt
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS

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
│   │   ├── App.jsx          # Main app component
│   │   └── index.js         # Entry point
│   ├── public/              # Static files
│   └── package.json
├── docs/                    # Documentation
│   └── context.md           # Project context
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
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
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neuro-recall
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Start the backend server:
```bash
node src/app.js
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### 4. Database Setup
Make sure MongoDB is running locally, or update the `MONGODB_URI` in your `.env` file to point to your MongoDB Atlas cluster.

## 📊 Database Schema

### User Model
- Email, password hash
- XP, rank, streak tracking
- Settings and preferences

### Note Model
- User association
- Content and metadata
- Tags and file information

### Quiz Model
- AI-generated questions
- Spaced repetition data (SM2 algorithm)
- Performance tracking

### QuizSession Model
- User quiz attempts
- Answer tracking
- Performance metrics

## 🔐 Authentication

The app uses JWT tokens for authentication:
- Tokens are stored in localStorage
- Protected routes require valid tokens
- Automatic token validation on API calls

## 🎮 Gamification System

- **XP Points**: Earn XP for uploading notes, completing quizzes
- **Ranks**: Progress through ranks (Neural Newbie → Recall Master)
- **Streaks**: Maintain daily learning streaks
- **Progress Tracking**: Visual progress indicators

## 🧠 Spaced Repetition

The app implements the SM2 algorithm for optimal review scheduling:
- Questions are scheduled based on difficulty ratings
- Easy questions appear less frequently
- Hard questions are reviewed more often
- Adaptive intervals based on performance

## 🚧 Next Steps

1. **AI Integration**: Connect OpenAI/DeepSeek for quiz generation
2. **Quiz Interface**: Build interactive quiz components
3. **Analytics Dashboard**: Create performance visualization
4. **Mobile App**: React Native/Expo implementation
5. **Advanced Features**: File upload, collaborative learning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@neurorecall.com or create an issue in the repository.

---

**Built with ❤️ for better learning**
