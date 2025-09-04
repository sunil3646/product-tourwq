import { useEffect, useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from "axios";

// Context for managing the global state of the application
const AppContext = createContext();

const MessageModal = ({ message, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4"
      >
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <p className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{message}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200"
          >
            OK
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const API_URL = "http://localhost:5000/api";

const App = () => {
  const [page, setPage] = useState('landing');
  // For the front-end version, we'll simulate a logged-in user
  const [user, setUser] = useState(null);
  // Initial tours data is hardcoded for the front-end demo
  const [tours, setTours] = useState([
    {
      id: 'tour-1',
      title: 'Getting Started with Arcade',
      steps: [
        { id: 1, text: 'Welcome to your dashboard! This is where you can manage all of your product tours.', image: 'https://placehold.co/800x600/2563EB/ffffff?text=Dashboard+View' },
        { id: 2, text: 'Click "Create New Tour" to start building your first guided experience.', image: 'https://placehold.co/800x600/2563EB/ffffff?text=Create+Tour+Button' },
        { id: 3, text: 'Each tour is made of steps, which can include screenshots and descriptive text.', image: 'https://placehold.co/800x600/2563EB/ffffff?text=Tour+Editor' },
      ],
      analytics: { views: 15, shares: 3 },
      isPublic: true,
      createdAt: new Date(),
    },
    {
      id: 'tour-2',
      title: 'Advanced Settings Overview',
      steps: [
        { id: 1, text: 'Our advanced settings allow you to customize your tour’s appearance and behavior.', image: 'https://placehold.co/800x600/2563EB/ffffff?text=Advanced+Settings' },
        { id: 2, text: 'You can change the theme from dark to light mode to match your website.', image: 'https://placehold.co/800x600/2563EB/ffffff?text=Theme+Settings' },
      ],
      analytics: { views: 8, shares: 1 },
      isPublic: false,
      createdAt: new Date(),
    },
  ]);
  const [editingTour, setEditingTour] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [message, setMessage] = useState('');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('landing');
  };

  const handleSaveTour = (tour) => {
    if (tour.id) {
      // Update existing tour
      setTours(tours.map(t => t.id === tour.id ? tour : t));
      setMessage('Tour updated successfully!');
    } else {
      // Add new tour
      const newTour = {
        ...tour,
        id: Date.now().toString(),
        analytics: { views: 0, shares: 0 },
        isPublic: false,
        createdAt: new Date(),
      };
      setTours([...tours, newTour]);
      setMessage('Tour created successfully!');
    }
    setEditingTour(null);
    setPage('dashboard');
  };

  const handleDeleteTour = (id) => {
    setTours(tours.filter(t => t.id !== id));
    setMessage('Tour deleted successfully!');
  };

  const handleEditTour = (tour) => {
    setEditingTour(tour);
    setPage('editor');
  };

  const handleCreateTour = () => {
    setEditingTour(null);
    setPage('editor');
  };

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage setPage={setPage} />;
      case 'login':
      case 'signup':
        return <AuthPage key={page} page={page} setPage={setPage} setUser={setUser} />;
      case 'dashboard':
        return <Dashboard tours={tours} onEdit={handleEditTour} onDelete={handleDeleteTour} onCreate={handleCreateTour} />;
      case 'editor':
        return <TourEditor tour={editingTour} onSave={handleSaveTour} onCancel={() => setPage('dashboard')} />;
      default:
        return <LandingPage setPage={setPage} />;
    }
  };

  const value = {
    page,
    setPage,
    user,
    tours,
    theme,
    toggleTheme,
    handleLogout,
    setMessage
  };

  return (
    <AppContext.Provider value={value}>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} font-sans transition-colors duration-300`}>
        <MessageModal message={message} onClose={() => setMessage('')} />
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </AppContext.Provider>
  );
};

const Header = () => {
  const { setPage, user, handleLogout, theme, toggleTheme } = useContext(AppContext);
  return (
    <header className="py-4 px-6 md:px-8 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <a onClick={() => setPage('landing')} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer">
            Arcade
          </a>
        </motion.div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage('dashboard')}
                className="text-gray-600 dark:text-gray-300 font-medium px-3 py-1.5 rounded-xl transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors duration-200"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage('login')}
                className="text-gray-600 dark:text-gray-300 font-medium px-3 py-1.5 rounded-xl transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Log In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage('signup')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors duration-200"
              >
                Sign Up
              </motion.button>
            </>
          )}
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-all duration-300 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            whileHover={{ scale: 1.1 }}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.button>
        </nav>
      </div>
    </header>
  );
};

const LandingPage = ({ setPage }) => (
  <section className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center">
    <motion.h1
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500"
    >
      Create Beautiful Product Tours
    </motion.h1>
    <motion.p
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="text-lg md:text-xl max-w-3xl mb-8 text-gray-600 dark:text-gray-400"
    >
      Seamlessly build interactive product demos, share them with your team, and get insights to grow.
    </motion.p>
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"
    >
      <button
        onClick={() => setPage('signup')}
        className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Get Started
      </button>
      <a
        href="#"
        className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-lg font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Learn More
      </a>
    </motion.div>
  </section>
);

const AuthPage = ({ page, setPage, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setMessage } = useContext(AppContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (email === '' || password === '') {
      setError('Please fill in all fields.');
      return;
    }

    // Simulate successful authentication
    setUser({ uid: 'mock-user-123' });
    setPage('dashboard');
    setMessage(`Successfully ${page === 'login' ? 'logged in' : 'signed up'}!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]"
    >
      <div className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {page === 'login' ? 'Log In' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              placeholder="Enter your email"
            />
          </motion.div>
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              placeholder="Enter your password"
            />
          </motion.div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-200 shadow-md"
          >
            {page === 'login' ? 'Log In' : 'Sign Up'}
          </motion.button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-600 dark:text-gray-400">
            {page === 'login' ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            onClick={() => setPage(page === 'login' ? 'signup' : 'login')}
            className="ml-2 text-indigo-500 font-semibold hover:underline"
          >
            {page === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ tours, onEdit, onDelete, onCreate }) => {
  const { theme, setMessage } = useContext(AppContext);
  const totalViews = tours.reduce((sum, tour) => sum + (tour.analytics?.views || 0), 0);
  const totalShares = tours.reduce((sum, tour) => sum + (tour.analytics?.shares || 0), 0);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors duration-200"
          >
            + Create New Tour
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Views" value={totalViews} icon="📈" />
        <DashboardCard title="Total Tours" value={tours.length} icon="🎯" />
        <DashboardCard title="Total Shares" value={totalShares} icon="🔗" />
        <DashboardCard title="Active Users" value="1" icon="👥" />
      </div>

      {tours.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-400">No tours created yet.</h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">Start by creating your first interactive product tour.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreate}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200"
          >
            Create Your First Tour
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map(tour => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative p-6 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                background: isDark ? 'linear-gradient(145deg, rgba(31,41,55,0.8), rgba(17,24,39,0.8))' : 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{tour.steps.length} steps</p>
              <div className="flex space-x-2">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                  {tour.isPublic ? 'Public' : 'Private'}
                </span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                  {tour.analytics?.views || 0} Views
                </span>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => onEdit(tour)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(tour.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => setMessage('Share functionality is not yet implemented.')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Share
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardCard = ({ title, value, icon }) => {
  const { theme } = useContext(AppContext);
  const isDark = theme === 'dark';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700"
      style={{
        background: isDark ? 'linear-gradient(145deg, rgba(31,41,55,0.6), rgba(17,24,39,0.6))' : 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center space-x-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h4>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const TourEditor = ({ tour, onSave, onCancel }) => {
  const [title, setTitle] = useState(tour?.title || '');
  const [steps, setSteps] = useState(tour?.steps || []);
  const [isRecording, setIsRecording] = useState(false);
  const { setMessage } = useContext(AppContext);
  const [isPreview, setIsPreview] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleAddStep = (isRecordingStep = false) => {
    setSteps(prevSteps => [
      ...prevSteps,
      {
        id: Date.now(),
        image: 'https://placehold.co/800x600/2563EB/ffffff?text=Screenshot+'+(prevSteps.length+1),
        text: isRecordingStep ? 'This is a recorded step.' : 'Add your text here.',
      },
    ]);
  };

  const handleUpdateStep = (id, newText) => {
    setSteps(prevSteps =>
      prevSteps.map(step => (step.id === id ? { ...step, text: newText } : step))
    );
  };

  const handleDeleteStep = (id) => {
    setSteps(prevSteps => prevSteps.filter(step => step.id !== id));
  };

  const handleScreenRecord = () => {
    setIsRecording(true);
    setMessage('Screen recording started...');
    setTimeout(() => {
      setIsRecording(false);
      handleAddStep(true);
      setMessage('Recording finished and a step was added.');
    }, 2000); // Simulate a 2-second recording
  };

  const handlePreview = () => {
    setIsPreview(true);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSave = () => {
    onSave({ id: tour?.id, title, steps, analytics: tour?.analytics || { views: 0, shares: 0 }, isPublic: false });
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="p-6 rounded-3xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-bold mb-6">
        {tour ? 'Edit Tour' : 'Create New Tour'}
      </h2>
      {!isPreview ? (
        <>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Tour Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              placeholder="e.g., Onboarding Tutorial"
            />
          </div>
          <div className="flex space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddStep()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors duration-200"
            >
              Add Step
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleScreenRecord}
              disabled={isRecording}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${isRecording ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {isRecording ? 'Recording...' : 'Record Screen'}
            </motion.button>
            {steps.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePreview}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors duration-200"
              >
                Preview Tour
              </motion.button>
            )}
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4"
              >
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <img src={step.image} alt={`Step ${index + 1}`} className="w-full rounded-lg shadow-md" />
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-lg font-semibold mb-2">Step {index + 1}</h3>
                  <textarea
                    value={step.text}
                    onChange={(e) => handleUpdateStep(step.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  />
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="mt-2 text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-200"
            >
              Save Tour
            </motion.button>
          </div>
        </>
      ) : (
        <TourPlayer steps={steps} onBack={() => setIsPreview(false)} />
      )}
    </div>
  );
};

const TourPlayer = ({ steps, onBack }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90 p-4"
    >
      <div className="w-full max-w-4xl h-auto md:h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        <div className="relative w-full md:w-2/3 h-96 md:h-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <AnimatePresence>
            <motion.img
              key={currentStep.id}
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              transition={{ duration: 0.5 }}
              src={currentStep.image}
              alt={`Step ${currentStepIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </AnimatePresence>
        </div>
        <div className="w-full md:w-1/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-indigo-500 font-semibold">{currentStepIndex + 1} / {steps.length}</span>
              <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h3 className="text-2xl font-bold mb-4">Tour Step {currentStepIndex + 1}</h3>
            <p className="text-gray-600 dark:text-gray-300">{currentStep.text}</p>
          </div>
          <div className="mt-6 flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${currentStepIndex === 0 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextStep}
              disabled={currentStepIndex === steps.length - 1}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${currentStepIndex === steps.length - 1 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {currentStepIndex === steps.length - 1 ? 'End Tour' : 'Next'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default App;
