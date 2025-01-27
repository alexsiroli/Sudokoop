const Game = require('../models/GameWithVite');

module.exports = function registerGameHandlers(socket, io, gameController) {
    // Oggetto per tenere traccia delle partite single player
    const games = {};
    // mi salvo i giocatori delle due squadre


    socket.on("checkMultiGameStart", (data) => {
        const {lobbyCode, mode} = data;
        if (mode === 'coop') {
            io.to(lobbyCode).emit("gameCanStart", gameController.coopGameCanStart(lobbyCode));
        } else {
            io.to(lobbyCode).emit("gameCanStart", gameController.versusGameCanStart(lobbyCode));
        }
    });

    socket.on("createCoopGame", (data) => {
        console.log("GAME HADLER creating coop Game" + data.lobbyCode + data.difficulty);
        gameController.createCoopGame(data.lobbyCode, data.difficulty);
    });


    socket.on("startCoopGame", (lobbyCode) => {
        io.to(lobbyCode).emit("startGame")
    });

    socket.on("getCoopGame", (lobbyCode) => {
        io.to(lobbyCode).emit("game",
            {
                vite: gameController.getGameOfLobby(lobbyCode).getVite(),
                sudoku: gameController.getGameOfLobby(lobbyCode).getSudoku(),
                difficulty: gameController.getGameOfLobby(lobbyCode).getDifficulty(),
            });
    });

    socket.on('getPlayersOfGame', (lobbyCode) => {
        const players = gameController.getPlayersOfGame(lobbyCode)
        io.to(lobbyCode).emit("playersOfGame", players);
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
/*
    socket.on("getTeamByColor", (data) => {
        const {color, lobbyCode} = data;
        const game =  gameController.getGameOfLobby(lobbyCode);
        io.to(lobbyCode).emit("teams", {
            playerTeam: color === "Gialla" ? game.getTeams().yellowTeam : game.getTeams().blueTeam,
            teamPoints: color === "Gialla" ? game.getTeamsPoint().yellowTeam : game.getTeamsPoint().blueTeam,
        })
    })


 */
    socket.on("backToLobby", (lobbyCode) => {
        gameController.removeGame(lobbyCode);
    })

    socket.on("leaveGame", (data) => {
        const {code, username} = data;
        gameController.removePlayerFromGame(code, username);
        io.to(code).emit("playersOfGame", gameController.getPlayersOfGame(code));
    })



    socket.on('cellUpdateMulti', (data) => {
        const {cellData, lobbyCode, username} = data;
        const partialResult = gameController.insertNumberWithoutCheck(cellData, lobbyCode);
        const result = gameController.insertNumberMulti(cellData, lobbyCode, username);

        if (!result.gameOver) {
            console.log("mando il parziale" + partialResult)
            io.to(lobbyCode).emit("insertedNumber", partialResult)
        }
        console.log("result after update " + result);
        io.to(lobbyCode).emit("afterUpdating",
            { data: result,
                username: username});
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
