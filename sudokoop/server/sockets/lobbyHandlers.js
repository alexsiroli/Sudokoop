const gameController = require('../controllers/gameController');

module.exports = function registerLobbyHandlers(socket, io, lobbyController) {

  // Creazione lobby
  socket.on("createLobby", username => {
    console.log("[DELME] SERVER: createLobby => user:", username);

    const newLobby = lobbyController.createLobby(username);
    socket.join(newLobby.code);

    socket.emit("onLobbyCreated", newLobby.code);

    // Aggiorna i players
    io.to(newLobby.code).emit("players", newLobby.players);
    console.log("[DELME] SERVER: Lobby creata => code:", newLobby.code);
  });

  // Join lobby
  socket.on("joinLobby", (data) => {
    const { username, code } = data;
    console.log("[DELME] SERVER: joinLobby => user:", username, " code:", code);

    const result = lobbyController.joinLobby(code, username);
    if (!result.success) {
      if (result.reason === "not-exist") {
        socket.emit("joinLobby", "Not exists");
      } else if (result.reason === "full") {
        socket.emit("joinLobby", "Full");
      }
      return;
    }
    // Se join avviene con successo
    socket.join(code);
    socket.emit("joinLobby", "Ok");

    // Aggiorna la lista dei giocatori nella lobby
    const lobby = lobbyController.findLobby(code);
    if (lobby) {
      io.to(code).emit("players", lobby.players);
    }
    console.log("[DELME] SERVER: user joined => code:", code, " user:", username);
  });

  // Gestione chat di lobby
  socket.on("lobbyMessage", (data) => {
    // data: { lobbyCode, author, text }
    console.log("[DELME] SERVER: lobbyMessage =>", data);
    const { lobbyCode, author, text } = data;
    io.in(lobbyCode).emit("lobbyMessage", {
      author,
      text,
      timestamp: Date.now()
    });
    console.log("[DELME] SERVER: => Inoltrato 'lobbyMessage' a:", lobbyCode);
  });

  // Abbandono della lobby: rimuove l'utente dalla lobby e lascia la room
  socket.on("leaveLobby", (data) => {
    const { code, username } = data;
    console.log("[DELME] SERVER: leaveLobby => code:", code, " user:", username);

    lobbyController.removePlayer(code, username);
    const updatedLobby = lobbyController.findLobby(code);
    if (updatedLobby) {
      io.to(code).emit("players", updatedLobby.players);
    }
    socket.leave(code);
  });

  // Recupero giocatori di una lobby specifica
  socket.on('getPlayersOfLobby', (lobbyCode) => {
    console.log("[DELME] SERVER: getPlayersOfLobby => code:", lobbyCode);
    const players = lobbyController.getPlayersOfLobby(lobbyCode);
    io.to(lobbyCode).emit("playersOfLobby", players);
  });

  // Avvio partita multiplayer
  socket.on("startMultiGame", (data) => {
    const { lobbyCode, mode, difficulty } = data;
    console.log("[DELME] SERVER: startMultiGame => code:", lobbyCode, " mode:", mode);

    const isMaster = lobbyController.isMaster(lobbyCode, socket.username);
    if (!isMaster) {
      socket.emit("notMaster");
      return;
    }
    if (lobbyController.getPlayersOfLobby(lobbyCode).length < 2) {
      io.to(lobbyCode).emit("notEnoughPlayers");
      return;
    }
    gameController.setGameOfLobby(lobbyCode, difficulty);
    io.to(lobbyCode).emit("gameStarted", mode);
    console.log("[DELME] SERVER: gameStarted => mode:", mode, "in lobby:", lobbyCode);
  });
};