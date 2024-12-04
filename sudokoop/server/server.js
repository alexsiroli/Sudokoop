const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Accetta qualsiasi origine
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
/*mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));


 */


// Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected'); // Questo viene stampato quando un client si connette

  // Gestione della disconnessione
  socket.on('disconnect', () => {
    console.log('Client disconnected'); // Questo viene stampato quando un client si disconnette
  });

  // Eventuali altri eventi da gestire
  socket.on('message', (msg) => {
    console.log('Message from client:', msg);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
