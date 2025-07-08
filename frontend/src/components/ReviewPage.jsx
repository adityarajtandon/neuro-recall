import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5001/api';

const ReviewPage = () => {
  const [dueQuizzes, setDueQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [ratings, setRatings] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDueQuizzes();
    setSessionStartTime(Date.now());
  }, []);

  const fetchDueQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/quizzes/due/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDueQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching due quizzes:', error);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const currentQuiz = dueQuizzes[currentQuizIndex];
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleRating = (questionId, rating) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    } else {
      // Move to next quiz
      if (currentQuizIndex < dueQuizzes.length - 1) {
        setCurrentQuizIndex(currentQuizIndex + 1);
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
      } else {
        // All quizzes completed
        handleFinishReview();
      }
    }
  };

  const handleFinishReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);

      // Prepare answers for all quizzes
      const allAnswers = [];
      dueQuizzes.forEach((quiz, quizIndex) => {
        quiz.questions.forEach((question, questionIndex) => {
          const questionId = question.questionId;
          const userAnswer = userAnswers[questionId] || '';
          const rating = ratings[questionId] || 'medium';
          
          allAnswers.push({
            questionId,
            userAnswer,
            rating,
            timeSpent: 0 // Could be enhanced to track per-question time
          });
        });
      });

      // Submit results for each quiz
      const results = [];
      for (const quiz of dueQuizzes) {
        const quizAnswers = allAnswers.filter(answer => 
          quiz.questions.some(q => q.questionId === answer.questionId)
        );

        const response = await axios.post(`${API_BASE}/quizzes/${quiz._id}/submit`, {
          answers: quizAnswers,
          duration
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        results.push(response.data);
      }

      // Navigate to results page or dashboard
      navigate('/dashboard', { 
        state: { 
          reviewCompleted: true, 
          results,
          totalQuizzes: dueQuizzes.length 
        }
      });

    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review results');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-dark-900 dark:text-white transition-colors">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading today's reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-dark-900 dark:text-white transition-colors">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={fetchDueQuizzes}
              className="bg-accent hover:bg-accent-blue text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dueQuizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-dark-900 dark:text-white transition-colors">
        <nav className="flex items-center justify-between px-8 py-6 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 shadow-glow transition-colors">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" className="mr-2" fill="currentColor" style={{ color: '#a259ff' }}>
              <path d="M16 2c-2.21 0-4 1.79-4 4v1.09C8.61 7.56 6 10.47 6 14v1c0 1.1.9 2 2 2v1c0 1.1.9 2 2 2v1c0 1.1.9 2 2 2s2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c0-3.53-2.61-6.44-6-6.91V6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2v1.09c2.39.47 4 2.38 4 4.91v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c0-1.1-.9-2-2-2s-2 .9-2 2v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c0-2.53 1.61-4.44 4-4.91V6c0-1.1-.9-2-2-2z"/>
            </svg>
            <span className="text-xl font-extrabold text-dark-900 dark:text-white group-hover:text-accent-blue transition tracking-tight font-sans">NeuroRecall</span>
          </Link>
        </nav>
        
        <div className="max-w-2xl mx-auto px-4 mt-20 text-center">
          <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-900 shadow-glow rounded-2xl p-8 transition-colors">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-accent mb-4">No Reviews Due Today!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Great job! You've completed all your scheduled reviews for today. 
              Check back tomorrow for new reviews based on your spaced repetition schedule.
            </p>
            <Link 
              to="/dashboard"
              className="bg-accent hover:bg-accent-blue text-white px-6 py-3 rounded-lg font-semibold shadow-glow transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-dark-900 dark:text-white transition-colors">
      <nav className="flex items-center justify-between px-8 py-6 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 shadow-glow transition-colors">
        <Link to="/dashboard" className="flex items-center space-x-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" className="mr-2" fill="currentColor" style={{ color: '#a259ff' }}>
            <path d="M16 2c-2.21 0-4 1.79-4 4v1.09C8.61 7.56 6 10.47 6 14v1c0 1.1.9 2 2 2v1c0 1.1.9 2 2 2v1c0 1.1.9 2 2 2s2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c0-3.53-2.61-6.44-6-6.91V6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2v1.09c2.39.47 4 2.38 4 4.91v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c0-1.1-.9-2-2-2s-2 .9-2 2v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c0-2.53 1.61-4.44 4-4.91V6c0-1.1-.9-2-2-2z"/>
          </svg>
          <span className="text-xl font-extrabold text-dark-900 dark:text-white group-hover:text-accent-blue transition tracking-tight font-sans">NeuroRecall</span>
        </Link>
        
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Review {currentQuizIndex + 1} of {dueQuizzes.length} • 
          Question {currentQuestionIndex + 1} of {currentQuiz?.questions.length}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {currentQuiz && currentQuestion && (
          <div className="glass-card p-8 animate-fade-in-up transition-colors">
            {/* Quiz Header */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold font-sora mb-2 bg-gradient-to-r from-accent via-accent-blue to-accent-pink bg-clip-text text-transparent tracking-tight">
                {currentQuiz.noteId?.filename || 'Untitled Note'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentQuiz.type.replace(/-/g, ' ').toUpperCase()} • 
                Next review: {new Date(currentQuiz.spacedRepetition.nextReview).toLocaleDateString()}
              </p>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1}:</h3>
              <p className="text-lg">{currentQuestion.question}</p>
            </div>

            {/* Answer Section */}
            {!showAnswer ? (
              <div className="mb-6">
                {currentQuiz.type === 'mcq' ? (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label key={index} className="flex items-center p-3 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-900 cursor-pointer transition">
                        <input
                          type="radio"
                          name={currentQuestion.questionId}
                          value={option}
                          checked={userAnswers[currentQuestion.questionId] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value)}
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    value={userAnswers[currentQuestion.questionId] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-700 rounded-lg bg-gray-50 dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-accent focus:border-accent"
                  />
                )}
                
                <button
                  onClick={() => setShowAnswer(true)}
                  className="mt-4 bg-accent hover:bg-accent-blue text-white px-6 py-3 rounded-full font-bold font-sora shadow-glow transition"
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="bg-gray-100 dark:bg-dark-900 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">Correct Answer:</h4>
                  <p className="text-lg">{currentQuestion.answer}</p>
                </div>

                {/* Rating Section */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">How difficult was this question?</h4>
                  <div className="flex space-x-4">
                    {[
                      { value: 'easy', label: 'Easy', color: 'bg-green-500 hover:bg-green-600' },
                      { value: 'medium', label: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600' },
                      { value: 'hard', label: 'Hard', color: 'bg-red-500 hover:bg-red-600' }
                    ].map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => handleRating(currentQuestion.questionId, rating.value)}
                        className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
                          ratings[currentQuestion.questionId] === rating.value 
                            ? rating.color 
                            : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      >
                        {rating.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="bg-accent hover:bg-accent-blue text-white px-6 py-3 rounded-full font-bold font-sora shadow-glow transition"
                >
                  {currentQuestionIndex < currentQuiz.questions.length - 1 
                    ? 'Next Question' 
                    : currentQuizIndex < dueQuizzes.length - 1 
                      ? 'Next Quiz' 
                      : 'Finish Review'
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage; 