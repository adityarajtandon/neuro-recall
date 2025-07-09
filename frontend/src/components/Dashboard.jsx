import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import neonBulb from '../assets/neon-bulb.png';

const QUIZ_TYPES = [
  { value: 'flashcard', label: 'Flashcard' },
  { value: 'mcq', label: 'MCQ' },
  { value: 'fill-in-the-blank', label: 'Fill in the Blank' }
];

const TIP_DELAY_MS = 3 * 60 * 60 * 1000; // 3 hours

const Dashboard = ({ user, onLogout, onNoteUpload, themeToggle }) => {
  const [notes, setNotes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    filename: '',
    content: '',
    tags: ''
  });
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizNoteId, setQuizNoteId] = useState(null);
  const [quizType, setQuizType] = useState('flashcard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dueQuizzesCount, setDueQuizzesCount] = useState(0);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);
  const [brainTips, setBrainTips] = useState([]);
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [tipsExhausted, setTipsExhausted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  // Helper: today's date string
  const todayStr = new Date().toISOString().slice(0, 10);

  // On mount, fetch tips and check localStorage for dismissed tips
  useEffect(() => {
    fetchNotes();
    fetchDueQuizzesCount();
    fetchBrainTips();
    
    // Check if user just completed a review
    if (location.state?.reviewCompleted) {
      setShowReviewSuccess(true);
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchDueQuizzesCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/quizzes/due/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDueQuizzesCount(response.data.length);
    } catch (error) {
      console.error('Error fetching due quizzes count:', error);
    }
  };

  const fetchBrainTips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/tips/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tipsArr = response.data.tips.map(t => t.tip);
      setBrainTips(tipsArr);
      // Check localStorage for dismissed tips
      const storedDate = localStorage.getItem('brainTipsDate');
      let dismissed = [];
      let lastDismissed = 0;
      if (storedDate === todayStr) {
        dismissed = JSON.parse(localStorage.getItem('brainTipsDismissed') || '[]');
        lastDismissed = parseInt(localStorage.getItem('brainTipsLastDismissed') || '0', 10);
      } else {
        // New day, reset
        localStorage.setItem('brainTipsDate', todayStr);
        localStorage.setItem('brainTipsDismissed', '[]');
        localStorage.setItem('brainTipsLastDismissed', '0');
      }
      // Find next tip to show
      if (dismissed.length >= tipsArr.length) {
        setTipsExhausted(true);
        setShowTips(false);
      } else {
        // Check if enough time has passed
        const now = Date.now();
        if (dismissed.length === 0 || now - lastDismissed >= TIP_DELAY_MS) {
          setCurrentTip(dismissed.length);
          setShowTips(true);
        } else {
          setShowTips(false);
        }
        setTipsExhausted(false);
      }
    } catch (error) {
      // fail silently
    }
  };

  // Show next tip (button or after delay)
  const handleShowNextTip = () => {
    const dismissed = JSON.parse(localStorage.getItem('brainTipsDismissed') || '[]');
    if (dismissed.length < brainTips.length) {
      setCurrentTip(dismissed.length);
      setShowTips(true);
    }
  };

  // Dismiss current tip
  const handleDismissTip = () => {
    const dismissed = JSON.parse(localStorage.getItem('brainTipsDismissed') || '[]');
    const newDismissed = [...dismissed, currentTip];
    localStorage.setItem('brainTipsDismissed', JSON.stringify(newDismissed));
    localStorage.setItem('brainTipsLastDismissed', Date.now().toString());
    setShowTips(false);
    if (newDismissed.length >= brainTips.length) {
      setTipsExhausted(true);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.filename || !uploadForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/notes`, {
        filename: uploadForm.filename,
        content: uploadForm.content,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotes([response.data.note, ...notes]);
      setUploadForm({ filename: '', content: '', tags: '' });
      alert(`Note uploaded successfully! +${response.data.xpGained} XP`);
      if (onNoteUpload) await onNoteUpload();
    } catch (error) {
      console.error('Error uploading note:', error);
      alert('Error uploading note');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateQuizClick = (noteId) => {
    setQuizNoteId(noteId);
    setQuizType('flashcard');
    setShowQuizModal(true);
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/notes/${quizNoteId}/generate-quiz`, { type: quizType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowQuizModal(false);
      setQuizNoteId(null);
      setQuizType('flashcard');
      fetchNotes();
      alert('Quiz generated successfully!');
      navigate(`/quiz/${response.data.quizId}`); // <-- Navigate to quiz page after quiz generation
    } catch (error) {
      alert('Quiz generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleStartReview = () => {
    navigate('/review');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-dark-900 dark:text-white pb-12 transition-colors">
      {/* Brain Tips Floating Icon and Pop-up */}
      <div className="fixed top-8 right-8 z-50 flex flex-col items-end">
        {showTips && brainTips.length > 0 && (
          <div className="relative mt-3 w-80 max-w-xs bg-accent-blue bg-opacity-95 text-white rounded-2xl shadow-glow px-6 py-5 animate-slide-in">
            <div className="flex-1 text-center">
              <span className="block text-2xl md:text-3xl font-extrabold font-sora mb-2 flex items-center justify-center gap-2">
                <span className="text-4xl drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)] bg-white bg-opacity-30 rounded-full px-2 py-1" style={{lineHeight:1}} role="img" aria-label="dna">🧬</span>
                Brain Optimization Tip
              </span>
              <span className="block mt-3 text-lg md:text-xl font-sora leading-relaxed">{brainTips[currentTip]}</span>
            </div>
            <button
              onClick={handleDismissTip}
              className="absolute top-2 right-2 text-white text-2xl font-bold hover:text-accent transition"
              aria-label="Dismiss tip"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <nav
        className="glass-card border-b border-accent/10 shadow-glow transition-colors bg-[radial-gradient(ellipse_at_50%_30%,_#f8fafc_0%,_#e2e8f0_100%)] dark:bg-[radial-gradient(ellipse_at_50%_30%,_#23263a_0%,_#10131a_100%)]"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <span className="mr-2 text-2xl" role="img" aria-label="brain">🧠</span>
                <span className="text-2xl font-bold text-accent group-hover:text-accent-blue transition">NeuroRecall</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 px-2 space-x-4">
                <span className="font-bold text-dark-900 dark:text-white text-base truncate max-w-[160px]">{user.email}</span>
                {/* XP Progress Bar */}
                <div className="w-32 sm:w-40 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 font-semibold">XP</span>
                    <span className="text-xs text-accent font-bold">{user.xp} / 1000</span>
                  </div>
                  <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-3 bg-gradient-to-r from-accent via-accent-blue to-accent-pink rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (user.xp / 1000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                {/* Streak Flame */}
                <span className="flex items-center">
                  <span className="text-2xl mr-1 animate-pulse-glow" style={{ filter: 'drop-shadow(0 0 8px #ff61d3)' }}>🔥</span>
                  <span className="text-pink-400 font-bold">{user.streak}</span>
                </span>
                {/* Rank Badge */}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-blue bg-opacity-20 text-accent-blue font-bold text-xs shadow-neon-blue tracking-wide overflow-hidden max-w-[140px]">
                  {user.rank === 'Neural Newbie' && <span className="text-lg" role="img" aria-label="brain">🧠</span>}
                  <span className="truncate">{user.rank}</span>
                </span>
              </div>
              {themeToggle}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-glow transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-10 px-4">
        {/* Review Success Notification */}
        {showReviewSuccess && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6 relative">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎉</div>
              <div>
                <strong>Review Completed!</strong> Great job completing today's spaced repetition reviews. 
                Your learning schedule has been updated based on your performance.
              </div>
            </div>
            <button
              onClick={() => setShowReviewSuccess(false)}
              className="absolute top-2 right-2 text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Review Section */}
        <div className="glass-card mb-10 p-8 transition-colors animate-fade-in-up relative group hover:shadow-neon-blue hover:-translate-y-1 duration-200 border-l-8 border-gradient-accent">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold font-sora mb-2 bg-gradient-to-r from-accent via-accent-blue to-accent-pink bg-clip-text text-transparent tracking-tight">Today's Reviews</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {dueQuizzesCount > 0 
                  ? `You have ${dueQuizzesCount} quiz${dueQuizzesCount === 1 ? '' : 'es'} due for review today`
                  : 'No reviews due today! Great job staying on top of your learning.'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-accent via-accent-blue to-accent-pink bg-clip-text text-transparent mb-1 font-sora">{dueQuizzesCount}</div>
              <div className="text-sm text-gray-500">Due Today</div>
            </div>
          </div>
          
          {dueQuizzesCount > 0 && (
            <button
              onClick={handleStartReview}
              className="w-full py-4 rounded-lg font-semibold bg-accent hover:bg-accent-blue shadow-glow text-white text-lg transition"
            >
              Start Today's Review
            </button>
          )}
          
          {dueQuizzesCount === 0 && (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-600 dark:text-gray-400">
                You're all caught up! Check back tomorrow for new reviews.
              </p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="glass-card mb-10 p-8 transition-colors animate-fade-in-up relative group hover:shadow-neon-pink hover:-translate-y-1 duration-200 border-l-8 border-gradient-accent">
          <h3 className="text-3xl md:text-4xl font-extrabold font-sora mb-6 bg-gradient-to-r from-accent via-accent-blue to-accent-pink bg-clip-text text-transparent tracking-tight">Upload New Note</h3>
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label htmlFor="filename" className="block text-base font-bold font-sora text-gray-200 mb-2 tracking-wide">Note Title</label>
              <input
                type="text"
                id="filename"
                value={uploadForm.filename}
                onChange={(e) => setUploadForm({...uploadForm, filename: e.target.value})}
                className="w-full px-5 py-4 bg-glass-light bg-opacity-60 border-2 border-transparent rounded-2xl text-white font-sans focus:border-gradient-accent focus:ring-2 focus:ring-accent focus:bg-dark-900 placeholder-gray-400 transition-all duration-200 shadow-inner backdrop-blur-md"
                placeholder="Enter note title"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-base font-bold font-sora text-gray-200 mb-2 tracking-wide">Content</label>
              <textarea
                id="content"
                rows={6}
                value={uploadForm.content}
                onChange={(e) => setUploadForm({...uploadForm, content: e.target.value})}
                className="w-full px-5 py-4 bg-glass-light bg-opacity-60 border-2 border-transparent rounded-2xl text-white font-sans focus:border-gradient-accent focus:ring-2 focus:ring-accent focus:bg-dark-900 placeholder-gray-400 transition-all duration-200 shadow-inner backdrop-blur-md"
                placeholder="Paste your notes here or write them directly..."
                required
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-base font-bold font-sora text-gray-200 mb-2 tracking-wide">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                className="w-full px-5 py-4 bg-glass-light bg-opacity-60 border-2 border-transparent rounded-2xl text-white font-sans focus:border-gradient-accent focus:ring-2 focus:ring-accent focus:bg-dark-900 placeholder-gray-400 transition-all duration-200 shadow-inner backdrop-blur-md"
                placeholder="e.g., math, physics, biology"
              />
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-4 rounded-full font-bold text-lg bg-accent hover:bg-accent-blue text-white font-sora tracking-wide focus:ring-2 focus:ring-accent focus:outline-none transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Note'}
            </button>
          </form>
        </div>

        {/* Notes List */}
        <div className="glass-card transition-colors animate-fade-in-up relative group hover:shadow-neon-blue hover:-translate-y-1 duration-200 border-l-8 border-gradient-accent">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-dark-900">
            <h3 className="text-2xl md:text-3xl font-extrabold font-sora bg-gradient-to-r from-accent via-accent-blue to-accent-pink bg-clip-text text-transparent tracking-tight">
              Your Notes <span className="ml-2">({notes.length})</span>
            </h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-dark-900">
            {notes.map((note) => (
              <li key={note._id} className="px-8 py-6 transition hover:bg-gray-100 dark:hover:bg-dark-900">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold font-sora bg-gradient-to-r from-accent via-accent-blue to-accent-pink bg-clip-text text-transparent truncate">
                      <Link to={`/note/${note._id}`} className="hover:underline">
                        {note.filename}
                      </Link>
                    </h4>
                    <p className="mt-1 text-base text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-900 rounded-lg px-3 py-2">
                      {note.content.substring(0, 100)}...
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>Uploaded: {new Date(note.uploadDate).toLocaleDateString()}</span>
                      {note.tags.length > 0 && (
                        <span className="ml-4 text-accent-blue">
                          Tags: {note.tags.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button className="bg-gradient-to-r from-accent via-accent-blue to-accent-pink hover:from-accent-blue hover:to-accent-pink text-white px-4 py-2 rounded-lg text-sm font-bold shadow-glow transition duration-200"
                      onClick={() => handleGenerateQuizClick(note._id)}
                    >
                      Generate Quiz
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {notes.length === 0 && (
              <li className="px-8 py-12 text-center text-gray-500">
                No notes uploaded yet. Upload your first note to get started!
              </li>
            )}
          </ul>
        </div>
        {/* Quiz Type Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 w-full max-w-sm border border-gray-200 dark:border-dark-900">
              <h3 className="text-xl font-bold mb-4 text-dark-900 dark:text-white">Select Quiz Type</h3>
              <select
                className="w-full mb-6 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-700 bg-gray-100 dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-accent focus:border-accent"
                value={quizType}
                onChange={e => setQuizType(e.target.value)}
                disabled={isGenerating}
              >
                {QUIZ_TYPES.map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-dark-700 text-dark-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-dark-800 transition border border-gray-400 dark:border-dark-600"
                  onClick={() => setShowQuizModal(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-blue text-white font-semibold shadow-glow transition disabled:opacity-50"
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;