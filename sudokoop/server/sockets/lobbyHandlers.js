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
    socket.emit("joinLobby", "Ok");
    // Re-invia la lista aggiornata (array di obj)
    io.to(code).emit("players", lobbyController.getPlayersOfLobby(code));
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
    lobbyController.removePlayerFromLobby(code, username);
    socket.leave(code);
    const updatedLobby = lobbyController.findLobby(code);

    if (updatedLobby) {
      io.to(code).emit("players", lobbyController.getPlayersOfLobby(code));
    }
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




  socket.on("joinTeam", (data) => {
    const { color, username, lobbyCode } = data;
    const res = lobbyController.addPlayerToTeam(lobbyCode, color, lobbyController.getPlayerFromUsername(lobbyCode, username));
    console.log(res);
    io.to(lobbyCode).emit("onJoinTeam", res);
  });






  // Avvio partita multiplayer
  socket.on('isUserTheMaster', (data) => {
    const {username, code} = data;
    if (lobbyController.isMaster(code, username)) {
      console.log(username + "is the master")
     ;
      console.log("il mio socket id " + socket.id)
      io.to(socket.id).emit("youAreTheMaster")
    }
  })

  socket.on("createVersusGame", (data) => {
    const {lobbyCode, difficulty} = data;
    if (lobbyController.versusGameCanStart(lobbyCode)) {
      lobbyController.createNewVersusGame(lobbyCode, difficulty);
      console.log("versusgame can start")
      io.to(lobbyCode).emit("versusGameCanStart")
    } else {
      io.to(lobbyCode).emit("notValidTeams")
    }
  });



  /*socket.on("checkForStartMultiGame", (data) => {
    const { lobbyCode, mode, username, difficulty } = data;
    const isMaster = lobbyController.isMaster(lobbyCode, username);
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

    // il gioco puo partire: viene creato

    gameController.createCoopGame(lobbyCode, difficulty, lobbyController.getPlayersOfLobby(lobbyCode));

    io.to(lobbyCode).emit("gameCanStart", mode);
  });

   */
};