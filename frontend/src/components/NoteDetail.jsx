import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [userInputs, setUserInputs] = useState({});
  const [flipped, setFlipped] = useState({});

  // Helper to get latest quiz
  const latestQuiz = note && note.quizzes && note.quizzes.length > 0 ? note.quizzes[note.quizzes.length - 1] : null;

  // MCQ: handle answer selection
  const handleMCQChange = (qid, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qid]: option });
  };
  const handleMCQSubmit = (e) => {
    e.preventDefault();
    let correct = 0;
    latestQuiz.questions.forEach(q => {
      if (selectedAnswers[q.questionId] === q.answer) correct++;
    });
    setScore(correct);
    setShowScore(true);
  };

  // Fill-in-the-blank: handle input
  const handleInputChange = (qid, value) => {
    setUserInputs({ ...userInputs, [qid]: value });
  };
  const handleFillSubmit = (e) => {
    e.preventDefault();
    let correct = 0;
    latestQuiz.questions.forEach(q => {
      if ((userInputs[q.questionId] || '').trim().toLowerCase() === q.answer.trim().toLowerCase()) correct++;
    });
    setScore(correct);
    setShowScore(true);
  };

  // Flashcard: handle flip
  const handleFlip = (qid) => {
    setFlipped({ ...flipped, [qid]: !flipped[qid] });
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNote(response.data);
      } catch (err) {
        setError('Could not fetch note.');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-300">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
  if (!note) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-dark-900 dark:text-white transition-colors">
      {/* Top Bar */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 shadow-glow transition-colors">
        <Link to="/" className="flex items-center space-x-2 group">
          {/* SVG Brain Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" className="mr-2" fill="currentColor" style={{ color: '#a259ff' }}>
            <path d="M16 2c-2.21 0-4 1.79-4 4v1.09C8.61 7.56 6 10.47 6 14v1c0 1.1.9 2 2 2v1c0 1.1.9 2 2 2v1c0 1.1.9 2 2 2v1c0 1.1.9 2 2 2s2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c1.1 0 2-.9 2-2v-1c0-3.53-2.61-6.44-6-6.91V6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2v1.09c2.39.47 4 2.38 4 4.91v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c0-1.1-.9-2-2-2s-2 .9-2 2v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c0-2.53 1.61-4.44 4-4.91V6c0-1.1-.9-2-2-2z"/>
          </svg>
          <span className="text-xl font-extrabold text-dark-900 dark:text-white group-hover:text-accent-blue transition tracking-tight font-sans">NeuroRecall</span>
        </Link>
      </nav>
      {/* Back Button */}
      <div className="max-w-3xl mx-auto px-4 mt-10 flex items-center">
        <button
          className="bg-accent hover:bg-accent-blue text-white font-semibold font-sans rounded-full px-6 py-2 shadow-glow text-lg flex items-center transition focus:outline-none focus:ring-2 focus:ring-accent"
          onClick={() => navigate(-1)}
        >
          <span className="mr-2 text-xl">←</span> Back
        </button>
      </div>
      {/* Note Card */}
      <div className="max-w-3xl mx-auto px-4 mt-6">
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-900 shadow-glow rounded-2xl p-8 transition-colors">
          <h2 className="text-3xl font-extrabold text-accent mb-2 font-sans">{note.filename}</h2>
          <div className="mb-2 text-sm text-gray-700 dark:text-gray-400 font-sans">
            Uploaded: {new Date(note.uploadDate).toLocaleDateString()}
          </div>
          {note.tags.length > 0 && (
            <div className="mb-2 text-xs text-accent-blue font-sans">
              Tags: {note.tags.join(', ')}
            </div>
          )}
          <pre className="whitespace-pre-wrap text-dark-900 dark:text-gray-100 bg-gray-100 dark:bg-dark-900 p-6 rounded-xl mt-4 overflow-x-auto text-base font-mono shadow-inner border border-gray-200 dark:border-dark-800 transition-colors">
            {note.content}
          </pre>
        </div>
      </div>
      {/* Quiz Section */}
      {latestQuiz && (
        <div className="max-w-3xl mx-auto px-4 mt-8">
          <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-900 shadow-glow rounded-2xl p-8 transition-colors">
            <h3 className="text-2xl font-bold text-accent mb-4 font-sans">Quiz: {latestQuiz.type.replace(/-/g, ' ').toUpperCase()}</h3>
            {/* MCQ Quiz */}
            {latestQuiz.type === 'mcq' && (
              <form onSubmit={handleMCQSubmit}>
                {latestQuiz.questions.map(q => (
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
                  </div>
                ))}
                {!showScore && (
                  <button type="submit" className="mt-4">Submit</button>
                )}
                {showScore && (
                  <div className="mt-4 text-lg font-bold text-accent">Score: {score} / {latestQuiz.questions.length}</div>
                )}
              </form>
            )}
            {/* Flashcard Quiz */}
            {latestQuiz.type === 'flashcard' && (
              <div className="space-y-6">
                {latestQuiz.questions.map(q => (
                  <div key={q.questionId} className="bg-gray-100 dark:bg-dark-900 rounded-xl p-6 shadow-inner border border-gray-200 dark:border-dark-800 transition-colors">
                    <div className="font-semibold mb-2">Q: {q.question}</div>
                    <button
                      className="mt-2 px-4 py-2 bg-accent hover:bg-accent-blue text-white rounded-lg font-semibold shadow-glow"
                      onClick={() => handleFlip(q.questionId)}
                      type="button"
                    >
                      {flipped[q.questionId] ? 'Hide Answer' : 'Show Answer'}
                    </button>
                    {flipped[q.questionId] && (
                      <div className="mt-3 text-accent font-bold">A: {q.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Fill in the Blank Quiz */}
            {latestQuiz.type === 'fill-in-the-blank' && (
              <form onSubmit={handleFillSubmit}>
                {latestQuiz.questions.map(q => (
                  <div key={q.questionId} className="mb-6">
                    <div className="font-semibold mb-2">{q.question}</div>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-700 bg-gray-100 dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-accent focus:border-accent"
                      value={userInputs[q.questionId] || ''}
                      onChange={e => handleInputChange(q.questionId, e.target.value)}
                      disabled={showScore}
                    />
                  </div>
                ))}
                {!showScore && (
                  <button type="submit" className="mt-4">Submit</button>
                )}
                {showScore && (
                  <div className="mt-4 text-lg font-bold text-accent">Score: {score} / {latestQuiz.questions.length}</div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDetail; 