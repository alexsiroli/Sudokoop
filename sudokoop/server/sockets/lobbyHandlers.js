module.exports = function registerLobbyHandlers(socket, io, lobbyController) {
  socket.on("createLobby", () => {
    const newLobby = lobbyController.createLobby(socket.username);
    socket.join(newLobby.code);

    socket.emit("onLobbyCreated", newLobby.code);

    // Emetto i player come array di obj
    io.to(newLobby.code).emit("players", newLobby.players);
  });

  socket.on("joinLobby", (code) => {
    const result = lobbyController.joinLobby(code, socket.username);
    if (!result.success) {
      if (result.reason === "not-exist") {
        socket.emit("joinLobby", "Not exists");
      } else if (result.reason === "full") {
        socket.emit("joinLobby", "Full");
      }
      return;
    }

    socket.join(code);
    socket.emit("joinLobby", "Ok");

    // Re-invia la lista aggiornata (array di obj)
    const lobby = lobbyController.findLobby(code);
    if (lobby) {
      io.to(code).emit("players", lobby.players);
    }
  });

  socket.on("startMultiGame", (data) => {
    const { lobbyCode, mode, difficulty } = data;
    const isMaster = lobbyController.isMaster(lobbyCode, socket.username);
    if (!isMaster) {
      socket.emit("notMaster");
      return;
    }
    io.to(lobbyCode).emit("gameStarted", { mode, difficulty });
  });
};
