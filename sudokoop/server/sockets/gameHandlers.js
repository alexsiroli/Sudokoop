const Game = require('../models/GameWithVite');
const VersusGame = require("../models/VersusGame");

module.exports = function registerGameHandlers(socket, io, gameController) {
    // Oggetto per tenere traccia delle partite single player
    const games = {};
    // mi salvo i giocatori delle due squadre


    socket.on("checkMultiGameStart", (data) => {
        const {lobbyCode, mode, difficulty} = data;
        console.log("check multigame start")
        let check = gameController.multiPlayerGameCanStart(lobbyCode, mode);
        if (check.res && mode === 'coop') {
            gameController.createCoopGame(data.lobbyCode, data.difficulty);
        }
        io.to(lobbyCode).emit("gameCanStart", {
            res: check,
            mode: mode,
            difficulty: difficulty,

        });
    });

    socket.on("createCoopGame", (data) => {
        gameController.createCoopGame(data.lobbyCode, data.difficulty);
    });


    socket.on("startCoopGame", (lobbyCode) => {
        io.to(lobbyCode).emit("startGame")
    });


    socket.on("getCoopGame", (lobbyCode) => {
        io.to(lobbyCode).emit("coopGame",
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

    socket.on("checkVersusGameCanStart", (data) => {
        const {lobbyCode, difficulty} = data;
        const check = gameController.versusGameCanStart(lobbyCode);
        if (check.res) {
            gameController.createVersusGame(lobbyCode, difficulty);
        }
        io.to(lobbyCode).emit("versusGameCanStart", check);
    });

    socket.on("checkRestartVersusGame", (data) => {
        const {lobbyCode, difficulty} = data;
        if (gameController.checkVersusGameCanRestart(lobbyCode)) {
            const check = gameController.versusGameCanStart(lobbyCode);
            if (check.res) {
                gameController.createVersusGame(lobbyCode, difficulty);
            }
            io.to(lobbyCode).emit("versusGameCanStart", check);
        } else {
            io.to(lobbyCode).emit("gameCanStart", {
                res: gameController.multiPlayerGameCanStart(lobbyCode, 'versus'),
                mode: 'versus',
                difficulty: difficulty,
            });
        }
    })

    socket.on("joinTeam", (data) => {
        const {lobbyCode, color, player} = data;
        io.to(lobbyCode).emit("onJoinTeam", gameController.addPlayerToTeam(lobbyCode, color, player));
    })


    socket.on("createVersusGame", (data) => {
        gameController.createVersusGame(data.lobbyCode, data.difficulty);
    });

    socket.on("getVersusGame", (lobbyCode) => {
        io.to(lobbyCode).emit("versusGame",
            {
                sudoku: gameController.getGameOfLobby(lobbyCode).getSudoku(),
                difficulty: gameController.getGameOfLobby(lobbyCode).getDifficulty(),
                yellowTeam: gameController.getGameOfLobby(lobbyCode).getTeams().yellowTeam,
                blueTeam: gameController.getGameOfLobby(lobbyCode).getTeams().blueTeam
            });
    });


    socket.on("startVersusGame", (lobbyCode) => {
        io.to(lobbyCode).emit("startGame")
    });

    socket.on("backToLobby", (lobbyCode) => {
        gameController.removeGame(lobbyCode);
    })

    socket.on("leaveGame", (data) => {
        const {code, username} = data;
        // rimuovendolo dal gioco, lo rimuovo dalla lobby
        gameController.removePlayerFromGame(code, username);
        io.to(code).emit("playersOfGame", gameController.getPlayersOfGame(code));
        io.to(code).emit("players", gameController.getPlayersOfLobby(code));
        socket.leave(code);
        // se era un versus game devo rimandare i team
        if (gameController.getGameOfLobby(code) instanceof VersusGame) {
            io.to(code).emit("teams",
                {
                    yellowTeam: gameController.getTeamsOfGame(code).yellowTeam,
                    blueTeam: gameController.getTeamsOfGame(code).blueTeam
                })
        }

    })

    socket.on("joinLobby", (data) => {
        const {username, code} = data;
        if (gameController.playersAreInTeamSelection(code)) {
            console.log("vai a scegliere i team")
            socket.emit('goInTeamSelection')
        }
    });


    socket.on('cellUpdateMulti', (data) => {
        const {cellData, lobbyCode, username} = data;
        const partialResult = gameController.insertNumberWithoutCheck(cellData, lobbyCode);
        const result = gameController.insertNumberMulti(cellData, lobbyCode, username);

        if (!result.gameOver) {
            io.to(lobbyCode).emit("insertedNumber", partialResult)
        }
        io.to(lobbyCode).emit("afterUpdating",
            {
                data: result,
                username: username
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
