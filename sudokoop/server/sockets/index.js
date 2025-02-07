const LobbyController = require('../controllers/lobbyController');
const gameController = require('../controllers/gameController');

const registerLobbyHandlers = require('./lobbyHandlers');
const registerGameHandlers = require('./gameHandlers');
const VersusGame = require("../models/VersusGame");

const User = require('../models/User');

module.exports = (io) => {
    const lobbyController = new LobbyController();

    io.on('connection', (socket) => {
        console.log("utente connesso");

        // Ogni client, dopo il login REST, emette "username" per comunicare chi è
        socket.on("username", (username) => {
            console.log("connected " + username);
            socket.username = username;
        });

        // Registra i vari handler di lobby (create/join ecc.)
        registerLobbyHandlers(socket, io, lobbyController);

        // Registra i vari handler di game (coop/versus ecc.)
        registerGameHandlers(socket, io, gameController);

        // Disconnessione
        socket.on('disconnect', async () => {
            console.log("utente disconnesso " + socket.username);

            // Se non sappiamo chi fosse lo user, usciamo
            if (!socket.username) return;

            try {
                // Se l'utente esiste ed è ancora online, settiamo offline
                const user = await User.findOne({ userName: socket.username });
                if (user && user.isOnline) {
                    user.isOnline = false;
                    await user.save();
                }
            } catch (err) {
                console.error("Errore nel set isOnline=false:", err);
            }

            // Rimuoviamo l'utente dalla lobby (se era in una)
            const lobby = lobbyController.findLobbyOfUser(socket.username);
            console.log("lobby ", lobby);

            if (lobby) {
                lobbyController.removePlayerFromLobby(lobby.code, socket.username);

                // Togliamo l'utente da eventuali team
                const removedFromTeam = gameController.removePlayerFromTeam(lobby.code, socket.username);
                // Rimuoviamolo anche dal gioco (coop o versus) se in corso
                if (gameController.removePlayerFromGame(lobby.code, socket.username)) {
                    const players = gameController.getPlayersOfGame(lobby.code);
                    io.to(lobby.code).emit("playersOfGame", players);

                    // Se era un VersusGame, aggiorniamo i team
                    if (gameController.getGameOfLobby(lobby.code) instanceof VersusGame) {
                        io.to(lobby.code).emit("teams", {
                            yellowTeam: gameController.getTeamsOfGame(lobby.code).yellowTeam,
                            blueTeam:   gameController.getTeamsOfGame(lobby.code).blueTeam
                        });
                    }
                } else if (removedFromTeam) {
                    // Era solo nei team, non in partita
                    io.to(lobby.code).emit("onJoinTeam", removedFromTeam);
                }

                // Aggiorniamo la lista players in lobby
                io.to(lobby.code).emit("players", lobbyController.getPlayersOfLobby(lobby.code));
            }
        });
    });
};