// Importa la classe Game
const Game = require('../models/Game');
const UserController = require('../controllers/UserController');
module.exports = (io) => {
    // Oggetto per tenere traccia dei giochi per ogni socket (giocatore)
    const games = {};
    const userController = new UserController();
    io.on('connection', (socket) => {
        console.log('Nuovo client connesso:', socket.id);

        // Quando un giocatore avvia una nuova partita
        socket.on('startGame', (difficolta) => {
            // Verifica la difficoltà fornita o imposta 'easy' di default
            const diff = ['easy', 'medium', 'hard'].includes(difficolta) ? difficolta : 'easy';

            // Crea una nuova istanza del gioco con la difficoltà scelta
            const game = new Game(diff);
            games[socket.id] = game;

            // Invia il puzzle al client
            socket.emit('gameData', {
                puzzle: game.sudoku.puzzle,
                vite: game.vite,
                emptyPlace: game.emptyPlace,
            });
        });

        // Gestione degli aggiornamenti delle celle
        socket.on('cellUpdate', (cellData) => {
            const game = games[socket.id];

            if (!game) {
                socket.emit('message', 'Nessuna partita in corso.');
                return;
            }

            const { row, col, value } = cellData;

            // Chiama il metodo insertNumber della classe Game
            const result = game.insertNumber(row, col, value);

            // Invia l'aggiornamento al client
            socket.emit('cellResult', {
                message: result,
                vite: game.vite,
                emptyPlace: game.emptyPlace,
                puzzle: game.sudoku.puzzle,
            });

            // Controlla se il gioco è terminato
            if (game.vite === 0) {
                socket.emit('gameOver', 'Hai perso! Vite terminate.');
                delete games[socket.id]; // Rimuove il gioco dall'elenco
            } else if (game.emptyPlace === 0) {
                socket.emit('gameWon', 'Complimenti! Hai completato il Sudoku.');
                delete games[socket.id]; // Rimuove il gioco dall'elenco
            }
        });

        socket.on("createLobby", () => {
            console.log("Received "  );
            const name = userController.createLobby(socket.id);
            socket.emit("onLobbyCreated", name)
            socket.join(name)
            io.to(name).emit("players", userController.getPlayersOfLobby(name))
        });

        socket.on("joinLobby", (name) => {
            if (userController.joinLobby(name, socket.id)) {
                socket.join(name)
                io.to(name).emit("players", userController.getPlayersOfLobby(name))
            } else {
                socket.emit("joinLobby", "Not valid")
            }
        });

        socket.on("lobbyPlayers", (lobbyName) => {
            socket.emit('lobbyPlayers', userController.getPlayersOfLobby(lobbyName));
        })
        // Gestione della disconnessione
        socket.on('disconnect', () => {
            console.log('Client disconnesso:', socket.id);
            // Rimuove il gioco dall'elenco se esiste
            delete games[socket.id];
        });
    });
};
