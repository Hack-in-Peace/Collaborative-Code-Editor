import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from './context/ThemeContext';

const HomePage = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [recentRooms, setRecentRooms] = useState([]);
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();

  useEffect(() => {
    const storedName = localStorage.getItem('username');
    const rooms = JSON.parse(localStorage.getItem('recentRooms')) || [];
    if (storedName) setUsername(storedName);
    setRecentRooms(rooms);
  }, []);

  useEffect(() => {
    if (username.trim()) {
      localStorage.setItem('username', username);
    }
  }, [username]);

  const handleJoin = () => {
    if (!username.trim() || !roomId.trim()) {
      alert('Please enter both name and room ID');
      return;
    }
    const updatedRooms = [roomId, ...recentRooms.filter(r => r !== roomId)].slice(0, 5);
    localStorage.setItem('recentRooms', JSON.stringify(updatedRooms));
    setRecentRooms(updatedRooms);
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  const createNewRoom = () => {
    const newId = uuidv4();
    setRoomId(newId);
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradientBlur opacity-60 z-0" />

      {/* Foreground Card */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="bg-white dark:bg-gray-900 p-14 rounded-2xl shadow-2xl w-full max-w-2xl transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🚀 Join a Code Room</h2>
            <button
              onClick={toggleTheme}
              className="text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white hover:opacity-80"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-semibold">
              {username ? username[0]?.toUpperCase() : '👤'}
            </div>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full mb-4 px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={createNewRoom}
              className="text-purple-600 hover:underline text-sm"
            >
              🔄 Generate New Room
            </button>
            <button
              onClick={handleJoin}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              Join ▶
            </button>
          </div>

          {recentRooms.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Recent Rooms</h3>
              <ul className="space-y-1">
                {recentRooms.map((id) => (
                  <li
                    key={id}
                    onClick={() => setRoomId(id)}
                    className="cursor-pointer px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 transition"
                  >
                    📁 {id}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
