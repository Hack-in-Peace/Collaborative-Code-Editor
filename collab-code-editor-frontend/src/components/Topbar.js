import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function Topbar({ username, onSave, runCode, selectedFile, typingUser }) {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-2 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
      {/* Left: File Tabs */}
      <div className="flex flex-col gap-1 min-h-[2.5rem]">
  <div className="flex gap-4">
    {selectedFile && (
      <button className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 cursor-default">
        📄 {selectedFile}
      </button>
    )}
    <button className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 cursor-default">
      🧾 Console
    </button>
  </div>

  {/* 👤 Typing Indicator */}
  {typingUser && (
    <div className="text-xs text-yellow-600 dark:text-yellow-300 transition-opacity duration-300">
      👤 {typingUser} is typing...
    </div>
  )}
</div>


      {/* Right: User Info + Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="bg-gray-300 dark:bg-gray-600 text-sm px-3 py-1 rounded hover:opacity-80"
        >
          {darkMode ? '🌞 Light Mode' : '🌚 Dark Mode'}
        </button>

        <span className="text-sm">👤 <strong>{username}</strong></span>

        <button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
        >
          💾 Save
        </button>

        <button
          onClick={runCode}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded"
        >
          ▶ Run
        </button>
      </div>
    </div>
  );
}
