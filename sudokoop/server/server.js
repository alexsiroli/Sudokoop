require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');

// Import delle rotte REST
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');

// Connessione DB
const connectDB = require('./db');
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Rotte REST
app.use("/api", userRoutes);
app.use("/api/game", gameRoutes);

// Socket
require('./sockets')(io);

// Avvio server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});