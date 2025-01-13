const gameController = require('../controllers/gameController');

module.exports = function registerLobbyHandlers(socket, io, lobbyController) {

  // Creazione lobby
  socket.on("createLobby", username => {
    console.log("[DELME] SERVER: createLobby event => user:", username);

    const newLobby = lobbyController.createLobby(username);
    socket.join(newLobby.code);

    socket.emit("onLobbyCreated", newLobby.code);

    // Invio la lista giocatori a tutti nella lobby
    io.to(newLobby.code).emit("players", newLobby.players);

    console.log("[DELME] SERVER: Lobby creata => code:", newLobby.code, "players:", newLobby.players);
  });

  // Join lobby
  socket.on("joinLobby", (data) => {
    const { username, code } = data;
    console.log("[DELME] SERVER: joinLobby event => user:", username, " code:", code);

    const result = lobbyController.joinLobby(code, username);
    if (!result.success) {
      if (result.reason === "not-exist") {
        socket.emit("joinLobby", "Not exists");
      } else if (result.reason === "full") {
        socket.emit("joinLobby", "Full");
      }
      return;
    }

    // Se ok
    socket.join(code);
    socket.emit("joinLobby", "Ok");
    console.log("[DELME] SERVER: user joined => code:", code, " user:", username);

    // Re-invia la lista aggiornata
    const lobby = lobbyController.findLobby(code);
    if (lobby) {
      io.to(code).emit("players", lobby.players);
      console.log("[DELME] SERVER: Emitting updated players =>", lobby.players);
    }
  });

  // Chat di lobby
  socket.on("lobbyMessage", (data) => {
    // data: { lobbyCode, author, text }
    console.log("[DELME] SERVER: Ricevuto 'lobbyMessage' =>", data);

    const { lobbyCode, author, text } = data;
    // Inoltriamo il messaggio a tutti nella lobby
    io.in(lobbyCode).emit("lobbyMessage", {
      author,
      text,
      timestamp: Date.now(),
    });

    console.log("[DELME] SERVER: Inoltrato 'lobbyMessage' a room:", lobbyCode);
  });

  // Altri handler
  socket.on('getPlayersOfLobby', (lobbyCode) => {
    console.log("[DELME] SERVER: getPlayersOfLobby => code:", lobbyCode);
    const players = lobbyController.getPlayersOfLobby(lobbyCode);
    io.to(lobbyCode).emit("playersOfLobby", players);
  });

  socket.on("startMultiGame", (data) => {
    const { lobbyCode, mode, difficulty } = data;
    console.log("[DELME] SERVER: startMultiGame => code:", lobbyCode, " mode:", mode, " difficulty:", difficulty);

    const isMaster = lobbyController.isMaster(lobbyCode, socket.username);
    if (!isMaster) {
      socket.emit("notMaster");
      return;
    }
    // se ci sono meno di 2 giocatori, errore
    if (lobbyController.getPlayersOfLobby(lobbyCode).length < 2) {
      io.to(lobbyCode).emit("notEnoughPlayers");
      return;
    }
    // Avvia la partita
    gameController.setGameOfLobby(lobbyCode, difficulty);
    io.to(lobbyCode).emit("gameStarted", mode);

    console.log("[DELME] SERVER: Game started =>", mode, "in lobby:", lobbyCode);
  });
};