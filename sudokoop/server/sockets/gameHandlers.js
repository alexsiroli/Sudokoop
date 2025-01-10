const Game = require('../models/Game');
const gameController = require('../controllers/gameController');
module.exports = function registerGameHandlers(socket, io) {
  // Oggetto per tenere traccia delle partite single player
  const games = {};

  socket.on("getGame", () => {
    console.log("Code " + socket.lobbyCode)
    socket.to( socket.lobbyCode).emit("game",
        {
          vite: gameController.getGameOfLobby( socket.lobbyCode).vite,
          sudoku: gameController.getGameOfLobby( socket.lobbyCode).sudoku.puzzle,

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
