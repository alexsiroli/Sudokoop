const LobbyController = require('../controllers/lobbyController');
const gameController = require('../controllers/gameController');

const registerLobbyHandlers = require('./lobbyHandlers');
const registerGameHandlers = require('./gameHandlers');

module.exports = (io) => {
    const lobbyController = new LobbyController();
    io.on('connection', (socket) => {
        console.log('Nuovo client connesso:', socket.id);

        // Ogni client, dopo il login REST, emette "username"
        socket.on("username", (username) => {
            socket.username = username;
            console.log("socket:", socket.id, "=> username:", username);
        });

        // Registra i vari handler
        registerLobbyHandlers(socket, io, lobbyController);
        registerGameHandlers(socket, io, gameController);

        // Disconnessione
        socket.on('disconnect', () => {
            console.log('Client disconnesso:', socket.id);
            // Rimuoviamo il player dalle lobby, se presente
            lobbyController.removePlayerFromLobby(socket.username);
        });
    });
};
