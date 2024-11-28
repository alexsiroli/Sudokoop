// Importa le librerie necessarie
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Game = require('./Game');

// Crea un'applicazione Express e un server HTTP
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve la pagina client su richiesta
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Gestisce la connessione dei client
this.game = new Game('easy');
io.on('connection', (socket) => {
    console.log('Un client si è connesso.');

    socket.emit('sudoku', this.game.sudoku.puzzle );

    // Riceve un messaggio dal client
    socket.on('message', (msg) => {
        console.log(`Messaggio ricevuto dal client: ${msg}`);

        // Risponde al client
        socket.emit('message', `Server: Ho ricevuto il tuo messaggio: "${msg}"`);
    });

    // Gestisce la disconnessione del client
    socket.on('disconnect', () => {
        console.log('Un client si è disconnesso.');
    });
});

// Avvia il server
server.listen(3000, () => {
    console.log('Server avviato su http://localhost:3000');
});
