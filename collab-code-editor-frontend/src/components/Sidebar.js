import { useState } from 'react';

export default function Sidebar({ files = [], onFileAdd, onFileSelect, connectedUsers = [], selectedFile }) {
  const [newFileName, setNewFileName] = useState('');
  const [newLang, setNewLang] = useState('javascript');

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">File List</h2>
        <ul className="mb-4">
          {files.map((file, index) => (
            <li
              key={index}
              className={`cursor-pointer py-1 px-2 rounded ${
                selectedFile === file.name ? 'bg-blue-700' : 'hover:bg-blue-600'
              }`}
              onClick={() => onFileSelect(file.name)}
            >
              📄 {file.name}
            </li>
          ))}
        </ul>

        <div className="space-y-2 mb-6">
          <input
            type="text"
            placeholder="File name (e.g. test.py)"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full text-black p-1 rounded"
          />
          <select
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            className="w-full text-black p-1 rounded"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <button
            onClick={() => {
              if (newFileName.trim()) {
                onFileAdd(newFileName.trim(), newLang);
                setNewFileName('');
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 py-1 rounded text-sm"
          >
            ➕ Add File
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Users in Room</h2>
        <ul className="space-y-2">
          {connectedUsers.map((user) => (
            <li key={user.id} className="text-sm">
              👤 {user.username}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert('Room link copied!');
        }}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm"
      >
        Copy Room Link
      </button>
    </div>
  );
}
