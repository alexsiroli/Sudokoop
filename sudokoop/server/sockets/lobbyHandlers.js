const gameController = require('../controllers/gameController');
module.exports = function registerLobbyHandlers(socket, io, lobbyController) {
  socket.on("createLobby", username => {
    console.log("Creating lobby " + username)
    const newLobby = lobbyController.createLobby(username);
    socket.join(newLobby.code);

    socket.emit("onLobbyCreated", newLobby.code);

    // Emetto i player come array di obj
    io.to(newLobby.code).emit("players", newLobby.players);
  });

  socket.on("joinLobby", (data) => {
    const {username, code} = data;
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
    socket.emit("joinLobby", "Ok");
    // Re-invia la lista aggiornata (array di obj)
    const lobby = lobbyController.findLobby(code);
    if (lobby) {
      io.to(code).emit("players", lobby.players);
    }
  });



  socket.on('getPlayersOfLobby', (lobbyCode) => {
    io.to(lobbyCode).emit("playersOfLobby", lobbyController.getPlayersOfLobby(lobbyCode));
  });

  socket.on("startMultiGame", (data) => {
    const { lobbyCode, mode, difficulty } = data;
    const isMaster = lobbyController.isMaster(lobbyCode, socket.username);
    if (!isMaster) {
      socket.emit("notMaster");
      return;
    }
    // se ci sono meno di due giocatori nella lobby, il gioco non può iniziare
    if (lobbyController.getPlayersOfLobby(lobbyCode).length < 2) {
      io.to(lobbyCode).emit("notEnoughPlayers");
      return;
    }
    // inizia il gioco, chiedo al gestore dei game di mandare la griglia
    console.log("mando agli altri il sudoku")
    // const game = gameController.newMultiPlayerGame(difficulty);
    //console.log("game" +  game.sudoku.puzzle);
    gameController.setGameOfLobby(lobbyCode, difficulty);
    io.to(lobbyCode).emit("gameStarted", mode);
  });
};
