import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import EditorPage from './EditorPage';
import { v4 as uuidV4 } from 'uuid';
import { ThemeProvider } from './context/ThemeContext';


const App = () => {
  return (
    <ThemeProvider>
    <div className="transition-theme duration-300 bg-white text-black dark:bg-black dark:text-white min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
        </Routes>
      </Router>
      </div>
    </ThemeProvider>
  );
};

export default App;
