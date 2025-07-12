const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const Document = require('./models/Document');
const executeRoute = require('./routes/execute');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/run', executeRoute);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// Root Route
app.get('/', (req, res) => res.send('Collaborative Code Editor Backend Running...'));

// In-memory storage for files per room
const fileStore = {}; // { roomId: [ { name, language, content } ] }

io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('join-document', ({ documentId, username }) => {
    socket.join(documentId);
    socket.username = username;

    // Initialize file store for this room if it doesn't exist
    if (!fileStore[documentId]) {
      fileStore[documentId] = [];
    }

    // Send existing files in the room to the newly joined client
    socket.emit('load-files', fileStore[documentId]);

    // Notify all clients in the room of the current user list
    updateUserList(documentId);

    // --- Handle new file creation ---
    socket.on('new-file', ({ file }) => {
      const existing = fileStore[documentId].some(f => f.name === file.name);
      if (!existing) {
        fileStore[documentId].push(file);
        io.to(documentId).emit('new-file', { file });
      }
    });

    // --- Handle file content changes ---
    socket.on('send-changes', ({ fileName, content, sender }) => {
      const files = fileStore[documentId];
      const file = files.find(f => f.name === fileName);
      if (file) {
        file.content = content;
      }
      socket.to(documentId).emit('receive-changes', { fileName, content, sender });
    });

    // --- Handle typing indicator ---
    socket.on('typing', ({ username }) => {
      socket.broadcast.to(documentId).emit('user-typing', username);
    });

    // --- Save document content to DB (if needed) ---
    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });

    // --- Disconnect cleanup ---
    socket.on('disconnect', () => {
      updateUserList(documentId);
    });
  });

  // Utility: Update and emit user list
  function updateUserList(roomId) {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const userList = clients.map(socketId => {
      const user = io.sockets.sockets.get(socketId);
      return {
        id: socketId,
        username: user?.username || 'Anonymous',
      };
    });
    io.to(roomId).emit('update-user-list', userList);
  }
});

// Utility: (optional) Find/create document in DB
const findOrCreateDocument = async (id) => {
  if (!id) return;

  let document = await Document.findById(id);
  if (document) return document;

  try {
    return await Document.create({ _id: id, data: '' });
  } catch (error) {
    if (error.code === 11000) {
      return await Document.findById(id);
    } else {
      throw error;
    }
  }
};

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
