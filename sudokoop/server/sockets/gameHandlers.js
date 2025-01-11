const Game = require('../models/Game');
const gameController = require('../controllers/gameController');
module.exports = function registerGameHandlers(socket, io) {
  // Oggetto per tenere traccia delle partite single player
  const games = {};

  socket.on("getGame", (lobbyCode) => {
    io.to( lobbyCode).emit("game",
        {
          vite: gameController.getGameOfLobby(lobbyCode).vite,
          sudoku: gameController.getGameOfLobby(lobbyCode).sudoku.puzzle,

        });
  });
  // Avvio partita single player
  socket.on('startGame', (difficulty) => {
    // Crea la nuova partita e assegna a games[socket.id]
    const game = new Game(difficulty || 'easy');
    games[socket.id] = game;

    // Invia puzzle al client
    socket.emit('gameData', {
      puzzle: game.sudoku.puzzle,
      vite: game.vite,
      emptyPlace: game.emptyPlace,
    });
  });

  socket.on('cellFocus', (data) => {
    const {rowIndex, colIndex, lobbyCode} = data;
    socket.to(lobbyCode).emit("cellFocus", {
      rowIndex: rowIndex,
      colIndex: colIndex,
    })
  })

  socket.on('cellUpdateMulti', (data) => {
    const {cellData, lobbyCode} = data;
    const partialResult = gameController.insertNumberWithoutCheck(cellData, lobbyCode);
    io.to(lobbyCode).emit("insertedNumber", partialResult)
    const result = gameController.insertNumberMulti(cellData, lobbyCode);
    console.log("result after update " + result);
    io.to(lobbyCode).emit("afterUpdating", result);
  });

  // Aggiornamento cella
  socket.on('cellUpdate', (cellData) => {
    const game = games[socket.id];
    if (!game) {
      socket.emit('message', 'Nessuna partita in corso.');
      return;
    }
    const { row, col, value } = cellData;
    const result = game.insertNumber(row, col, value);

    socket.emit('cellResult', {
      message: result,
      vite: game.vite,
      emptyPlace: game.emptyPlace,
      puzzle: game.sudoku.puzzle,
    });

    if (game.vite === 0) {
      socket.emit('gameOver', 'Hai perso! Vite esaurite.');
      delete games[socket.id];
    } else if (game.emptyPlace === 0) {
      socket.emit('gameWon', 'Complimenti! Hai completato il Sudoku.');
      delete games[socket.id];
    }
  });
};
