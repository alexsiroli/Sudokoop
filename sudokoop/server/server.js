const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Modifica con l'URL del tuo client se necessario
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Rotte (stub per ora)
app.get('/', (req, res) => {
  res.send('Server è in esecuzione');
});

// Socket.IO
require('./sockets')(io);

// Avvio del server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));
