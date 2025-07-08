import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5001/api';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [userInputs, setUserInputs] = useState({});
  const [flipped, setFlipped] = useState({});
  const [answerFeedback, setAnswerFeedback] = useState({});
  const [ratings, setRatings] = useState({});
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuiz(response.data);
      } catch (err) {
        setError('Could not fetch quiz.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // MCQ: handle answer selection
  const handleMCQChange = (qid, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qid]: option });
  };
  const handleMCQSubmit = (e) => {
    e.preventDefault();
    let correct = 0;
    const feedback = {};
    quiz.questions.forEach(q => {
      if (selectedAnswers[q.questionId] === q.answer) {
        correct++;
        feedback[q.questionId] = 'correct';
      } else {
        feedback[q.questionId] = 'incorrect';
      }
    });
    setScore(correct);
    setAnswerFeedback(feedback);
    setShowScore(true);
    setShowRating(true);
  };

  // Fill-in-the-blank: handle input
  const handleInputChange = (qid, value) => {
    setUserInputs({ ...userInputs, [qid]: value });
  };
  const handleFillSubmit = (e) => {
    e.preventDefault();
    let correct = 0;
    const feedback = {};
    quiz.questions.forEach(q => {
      if ((userInputs[q.questionId] || '').trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        correct++;
        feedback[q.questionId] = 'correct';
      } else {
        feedback[q.questionId] = 'incorrect';
      }
    });
    setScore(correct);
    setAnswerFeedback(feedback);
    setShowScore(true);
    setShowRating(true);
  };

  // Flashcard: handle flip
  const handleFlip = (qid) => {
    setFlipped({ ...flipped, [qid]: !flipped[qid] });
  };

  // Handle rating for spaced repetition
  const handleRating = (qid, rating) => {
    setRatings(prev => ({
      ...prev,
      [qid]: rating
    }));
  };

  // Submit quiz results to spaced repetition system
  const handleSubmitResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const answers = quiz.questions.map(q => {
        let userAnswer = '';
        if (quiz.type === 'mcq') {
          userAnswer = selectedAnswers[q.questionId] || '';
        } else if (quiz.type === 'fill-in-the-blank') {
          userAnswer = userInputs[q.questionId] || '';
        } else {
          // For flashcards, we'll use a simple check
          userAnswer = flipped[q.questionId] ? 'viewed' : 'not_viewed';
        }
        
        return {
          questionId: q.questionId,
          userAnswer,
          rating: ratings[q.questionId] || ratings['overall'] || 'medium',
          timeSpent: 0
        };
      });

      await axios.post(`${API_BASE}/quizzes/${quizId}/submit`, {
        answers,
        duration: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Quiz submitted! Your spaced repetition schedule has been updated.');
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to submit quiz results, but your answers and feedback are still shown below.');
      // Still show the correct answer and spaced repetition UI
      setShowScore(true);
      setShowRating(true);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-300">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-dark-900 dark:text-white transition-colors">
      <nav className="flex items-center justify-between px-8 py-6 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 shadow-glow transition-colors">
        <Link to="/dashboard" className="flex items-center space-x-2 group">
          <span className="mr-2 text-2xl" role="img" aria-label="brain">🧠</span>
          <span className="text-xl font-extrabold text-dark-900 dark:text-white group-hover:text-accent-blue transition tracking-tight font-sans">NeuroRecall</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-4 mt-10">
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg font-semibold text-center">
            {error}
          </div>
        )}
        <div className="glass-card p-8 animate-fade-in-up transition-colors">
          <h2 className="text-3xl md:text-4xl font-extrabold font-sora mb-6 bg-gradient-to-r from-accent via-accent-blue to-accent-pink bg-clip-text text-transparent tracking-tight">Quiz: {quiz.type.replace(/-/g, ' ').toUpperCase()}</h2>
          {/* MCQ Quiz */}
          {quiz.type === 'mcq' && (
            <form onSubmit={handleMCQSubmit}>
              {quiz.questions.map(q => (
                <div key={q.questionId} className="mb-6">
                  <div className="font-semibold mb-2">{q.question}</div>
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <label key={opt} className="block">
                        <input
                          type="radio"
                          name={q.questionId}
                          value={opt}
                          checked={selectedAnswers[q.questionId] === opt}
                          onChange={() => handleMCQChange(q.questionId, opt)}
                          className="mr-2"
                          disabled={showScore}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {showScore && (
                    <div className={"mt-2 " + (answerFeedback[q.questionId] === 'correct' ? 'text-green-500' : 'text-red-400')}>{answerFeedback[q.questionId] === 'correct' ? 'Correct!' : `Incorrect. Correct answer: ${q.answer}`}</div>
                  )}
                </div>
              ))}
              {!showScore && (
                <button type="submit" className="mt-4 bg-accent hover:bg-accent-blue text-white px-6 py-3 rounded-full font-bold font-sora shadow-glow transition">Submit</button>
              )}
              {showScore && (
                <div className="mt-4 text-lg font-bold text-accent">Score: {score} / {quiz.questions.length}</div>
              )}
              
              {showRating && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-dark-900 rounded-lg">
                  <h4 className="font-semibold mb-3">Rate this quiz for spaced repetition:</h4>
                  <div className="flex space-x-4 mb-4">
                    {[
                      { value: 'easy', label: 'Easy', color: 'bg-green-500 hover:bg-green-600' },
                      { value: 'medium', label: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600' },
                      { value: 'hard', label: 'Hard', color: 'bg-red-500 hover:bg-red-600' }
                    ].map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => handleRating('overall', rating.value)}
                        className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                          ratings['overall'] === rating.value 
                            ? rating.color 
                            : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      >
                        {rating.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitResults}
                    className="bg-accent hover:bg-accent-blue text-white px-6 py-2 rounded-lg font-semibold shadow-glow transition"
                  >
                    Submit Results
                  </button>
                </div>
              )}
            </form>
          )}
          {/* Flashcard Quiz */}
          {quiz.type === 'flashcard' && (
            <div className="space-y-6">
              {quiz.questions.map(q => (
                <div key={q.questionId} className="bg-gray-100 dark:bg-dark-900 rounded-xl p-6 shadow-inner border border-gray-200 dark:border-dark-800 transition-colors">
                  <div className="font-semibold mb-2">Q: {q.question}</div>
                  <button
                    className="mt-2 px-4 py-2 bg-accent hover:bg-accent-blue text-white rounded-full font-bold font-sora shadow-glow transition"
                    onClick={() => handleFlip(q.questionId)}
                    type="button"
                  >
                    {flipped[q.questionId] ? 'Hide Answer' : 'Show Answer'}
                  </button>
                  {flipped[q.questionId] && (
                    <div className="mt-3 text-accent font-bold">A: {q.answer}</div>
                  )}
                  {showScore && (
                    <div className={"mt-2 " + (answerFeedback[q.questionId] === 'correct' ? 'text-green-500' : 'text-red-400')}>
                      {answerFeedback[q.questionId] === 'correct' ? 'Correct!' : `Incorrect. Correct answer: ${q.answer}`}
                    </div>
                  )}
                </div>
              ))}
              {showScore && (
                <div className="mt-6 text-lg font-bold text-accent">Quiz Report: {score} / {quiz.questions.length} correct</div>
              )}
              
              {showRating && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-dark-900 rounded-lg">
                  <h4 className="font-semibold mb-3">Rate this quiz for spaced repetition:</h4>
                  <div className="flex space-x-4 mb-4">
                    {[
                      { value: 'easy', label: 'Easy', color: 'bg-green-500 hover:bg-green-600' },
                      { value: 'medium', label: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600' },
                      { value: 'hard', label: 'Hard', color: 'bg-red-500 hover:bg-red-600' }
                    ].map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => handleRating('overall', rating.value)}
                        className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                          ratings['overall'] === rating.value 
                            ? rating.color 
                            : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      >
                        {rating.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitResults}
                    className="bg-accent hover:bg-accent-blue text-white px-6 py-2 rounded-lg font-semibold shadow-glow transition"
                  >
                    Submit Results
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Fill in the Blank Quiz */}
          {quiz.type === 'fill-in-the-blank' && (
            <form onSubmit={handleFillSubmit}>
              {quiz.questions.map(q => (
                <div key={q.questionId} className="mb-6">
                  <div className="font-semibold mb-2">{q.question}</div>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-700 bg-gray-100 dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-accent focus:border-accent"
                    value={userInputs[q.questionId] || ''}
                    onChange={e => handleInputChange(q.questionId, e.target.value)}
                    disabled={showScore}
                  />
                  {showScore && (
                    <div className={"mt-2 " + (answerFeedback[q.questionId] === 'correct' ? 'text-green-500' : 'text-red-400')}>
                      {answerFeedback[q.questionId] === 'correct' ? 'Correct!' : `Incorrect. Correct answer: ${q.answer}`}
                    </div>
                  )}
                </div>
              ))}
              {!showScore && (
                <button type="submit" className="mt-4 bg-accent hover:bg-accent-blue text-white px-6 py-3 rounded-full font-bold font-sora shadow-glow transition">Submit</button>
              )}
              {showScore && (
                <div className="mt-6 text-lg font-bold text-accent">Quiz Report: {score} / {quiz.questions.length} correct</div>
              )}
              
              {showRating && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-dark-900 rounded-lg">
                  <h4 className="font-semibold mb-3">Rate this quiz for spaced repetition:</h4>
                  <div className="flex space-x-4 mb-4">
                    {[
                      { value: 'easy', label: 'Easy', color: 'bg-green-500 hover:bg-green-600' },
                      { value: 'medium', label: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600' },
                      { value: 'hard', label: 'Hard', color: 'bg-red-500 hover:bg-red-600' }
                    ].map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => handleRating('overall', rating.value)}
                        className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                          ratings['overall'] === rating.value 
                            ? rating.color 
                            : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      >
                        {rating.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitResults}
                    className="bg-accent hover:bg-accent-blue text-white px-6 py-2 rounded-lg font-semibold shadow-glow transition"
                  >
                    Submit Results
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage; 