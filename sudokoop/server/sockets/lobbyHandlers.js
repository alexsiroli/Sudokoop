module.exports = function registerLobbyHandlers(socket, io, lobbyController) {

  // Creazione lobby
  socket.on("createLobby", username => {
    const newLobby = lobbyController.createLobby(username);
    socket.join(newLobby.code);
    socket.emit("onLobbyCreated", newLobby.code);
    // Aggiorna i players
    io.to(newLobby.code).emit("players", lobbyController.getPlayersOfLobby(newLobby.code));
  });


  // Join lobby
  socket.on("joinLobby", (data) => {
    const { username, code } = data;
    const result = lobbyController.joinLobby(code, username);
    if (!result.success) {
      if (result.reason === "not-exist") {
        socket.emit("joinLobby", "Not exists");
      } else if (result.reason === "full") {
        socket.emit("joinLobby", "Full");
      }
      return;
    }
    socket.join(code);
    socket.emit("joinLobby", {
      res: "Ok",
      lobbyCode: code,
    });
    // Re-invia la lista aggiornata (array di obj)
    io.to(code).emit("players", lobbyController.getPlayersOfLobby(code));
  });


  // Gestione chat di lobby
  socket.on("lobbyMessage", (data) => {
    // data: { lobbyCode, author, text }
    const { lobbyCode, author, text } = data;
    io.in(lobbyCode).emit("lobbyMessage", {
      author,
      text,
      timestamp: Date.now()
    });
  });

  // Abbandono della lobby: rimuove l'utente dalla lobby e lascia la room
  socket.on("leaveLobby", (data) => {
    const { code, username } = data;
    lobbyController.removePlayerFromLobby(code, username);
    socket.leave(code);
    io.to(code).emit("players", lobbyController.getPlayersOfLobby(code));
  });

  // Recupero giocatori di una lobby specifica
  socket.on('getPlayersOfLobby', (lobbyCode) => {
    const players = lobbyController.getPlayersOfLobby(lobbyCode);
    io.to(lobbyCode).emit("players", players);
  });


  socket.on("backToLobby", lobbyCode => {
    io.to(lobbyCode).emit("backToLobby");
    // reinvio anche i giocatori
    const lobby = lobbyController.findLobby(lobbyCode);
    if (lobby) {
      io.to(lobbyCode).emit("players", lobbyController.getPlayersOfLobby(lobbyCode));
    }
  });
};