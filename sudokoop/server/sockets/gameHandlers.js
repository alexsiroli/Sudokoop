const Game = require('../models/GameWithVite');
const gameController = require('../controllers/gameController');
module.exports = function registerGameHandlers(socket, io) {
    // Oggetto per tenere traccia delle partite single player
    const games = {};
    // mi salvo i giocatori delle due squadre
    socket.on("getGame", (lobbyCode) => {
        io.to(lobbyCode).emit("game",
            {
                vite: gameController.getGameOfLobby(lobbyCode).vite,
                sudoku: gameController.getGameOfLobby(lobbyCode).sudoku.puzzle,
                difficulty: gameController.getGameOfLobby(lobbyCode).sudoku.difficulty,
            });
    });

    socket.on("getVersusGame", (lobbyCode) => {
        io.to(lobbyCode).emit("game",
            {
                sudoku: gameController.getGameOfLobby(lobbyCode).sudoku.puzzle,
                difficulty: gameController.getGameOfLobby(lobbyCode).sudoku.difficulty,
                yellowTeam: gameController.getGameOfLobby(lobbyCode).yellowTeam,
                blueTeam: gameController.getGameOfLobby(lobbyCode).blueTeam,
            });
    });

    socket.on("createNewGame", (data) => {
        console.log("creating new game")
        const {lobbyCode, difficulty} = data;
        gameController.createNewGame(lobbyCode, difficulty);
        io.to(lobbyCode).emit("restartTheGame")
    });

    socket.on("createVersusGame", (data) => {
        const {lobbyCode, difficulty} = data;
        gameController.createVersusGame(lobbyCode, difficulty);
        console.log("versusgame can start")
        io.to(lobbyCode).emit("versusGameCanStart")
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

    socket.on("joinTeam", (data) => {
        const { color, username, lobbyCode } = data;
        gameController.addPlayerToTeam(lobbyCode, color, username);
        io.to(lobbyCode).emit("onJoinTeam", {
            color: color,
            username: username,
        });
    });

    socket.on('cellFocus', (data) => {
        const {rowIndex, colIndex, lobbyCode} = data;
        io.to(lobbyCode).emit("cellFocus", {
            rowIndex: rowIndex,
            colIndex: colIndex,
        })
    })

    socket.on('cellDeselect', (data) => {
        const {rowIndex, colIndex, lobbyCode} = data;
        io.to(lobbyCode).emit("cellDeselect", {
            rowIndex: rowIndex,
            colIndex: colIndex,
        })
    })
    socket.on('cellUpdateMulti', (data) => {
        const {cellData, lobbyCode} = data;
        const partialResult = gameController.insertNumberWithoutCheck(cellData, lobbyCode);
        const result = gameController.insertNumberMulti(cellData, lobbyCode);
        if (!result.gameOver) {
            io.to(lobbyCode).emit("insertedNumber", partialResult)
        }
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
        const {row, col, value} = cellData;
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
