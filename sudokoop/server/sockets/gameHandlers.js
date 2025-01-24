const Game = require('../models/GameWithVite');

module.exports = function registerGameHandlers(socket, io, gameController) {
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


    socket.on("checkMultiGameStart", (data) => {
        const {lobbyCode, mode} = data;
        if (mode === 'coop') {
            io.to(lobbyCode).emit("gameCanStart", gameController.coopGameCanStart(lobbyCode));
        } else {
            io.to(lobbyCode).emit("gameCanStart", gameController.versusGameCanStart(lobbyCode));
        }
    });

    socket.on("getVersusGame", (lobbyCode) => {
        io.to(lobbyCode).emit("game",
            {
                sudoku: gameController.getGameOfLobby(lobbyCode).sudoku.puzzle,
                difficulty: gameController.getGameOfLobby(lobbyCode).sudoku.difficulty,
                yellowTeam: gameController.getGameOfLobby(lobbyCode).yellow.team,
                blueTeam: gameController.getGameOfLobby(lobbyCode).blue.team,
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
        const {rowIndex, colIndex, lobbyCode, color} = data;
        io.to(lobbyCode).emit("cellFocus", {
            rowIndex: rowIndex,
            colIndex: colIndex,
            color: color,
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
        const {cellData, lobbyCode, color, username} = data;
        const partialResult = gameController.insertNumberWithoutCheck(cellData, lobbyCode);
        const result = gameController.insertNumberMulti(cellData, lobbyCode, username);
        if (!result.gameOver) {
            io.to(lobbyCode).emit("insertedNumber", partialResult)
        }
        console.log("result after update " + result);
        io.to(lobbyCode).emit("afterUpdating",
            { data: result,
            color: color,
            username: username});
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
