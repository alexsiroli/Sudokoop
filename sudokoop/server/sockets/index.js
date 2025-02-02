const LobbyController = require('../controllers/lobbyController');
const gameController = require('../controllers/gameController');

const registerLobbyHandlers = require('./lobbyHandlers');
const registerGameHandlers = require('./gameHandlers');
const VersusGame = require("../models/VersusGame");

module.exports = (io) => {
    const lobbyController = new LobbyController();

    io.on('connection', (socket) => {
        console.log("utente connesso")
        // Ogni client, dopo il login REST, emette "username"
        socket.on("username", (username) => {
            console.log("connected " + username)
            socket.username = username;
        });

        // Registra i vari handler
        registerLobbyHandlers(socket, io, lobbyController);
        registerGameHandlers(socket, io, gameController);

        // Disconnessione
        socket.on('disconnect', () => {
            console.log("utente disconnesso " + socket.username);  //

            if (!socket.username) return;  // Evitiamo errori se `username` non è stato impostato
            // Rimuoviamo il player dalla lobby se presente
            const lobby = lobbyController.findLobbyOfUser(socket.username);
            console.log("lobby ", lobby);
            const removedFromTeam = gameController.removePlayerFromTeam(lobby.code, socket.username)
            console.log("removedFRomTEam", removedFromTeam)
            lobbyController.removePlayerFromLobby(lobby.code, socket.username);
            if (lobby) {
                if (gameController.removePlayerFromGame(lobby.code, socket.username)) {
                    console.log("lo rimuovo dal gioco");
                    const players = gameController.getPlayersOfGame(lobby.code);
                    console.log("mando i players of game", players);
                    io.to(lobby.code).emit("playersOfGame", players);
                    if (gameController.getGameOfLobby(lobby.code) instanceof VersusGame) {
                        io.to(lobby.code).emit("teams",
                            {
                                yellowTeam: gameController.getTeamsOfGame(lobby.code).yellowTeam,
                                blueTeam: gameController.getTeamsOfGame(lobby.code).blueTeam
                            })
                    }

                } else if(removedFromTeam) {
                    console.log("rimosso dal team, mando ", removedFromTeam)
                    io.to(lobby.code).emit("onJoinTeam", removedFromTeam);
                }

                else {
                    console.log("non l ho rimosso dal gioco");


                }
                io.to(lobby.code).emit("players", lobbyController.getPlayersOfLobby(lobby.code));
            }
        });
    });
};
