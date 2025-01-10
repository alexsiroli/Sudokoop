const Game = require('../models/Game');

// Mappa in memoria per associare gameId alle istanze di Game
const activeGames = {};
const lobbyGame = {};
const gameController = {
    // Funzione per generare un gameId basato sul timestamp
    generateGameId: () => {
        return `game_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    },

    // Endpoint per avviare una nuova partita
    newSinglePlayerGame: (req, res) => {
        const difficulty = req.query.difficulty || 'easy';
        const gameId = gameController.generateGameId();

        const newGame = new Game(difficulty);
        activeGames[gameId] = newGame;

        return res.status(200).json({
            gameId,
            puzzle: newGame.sudoku.puzzle,
            vite: newGame.vite,
        });
    },

    setGameOfLobby: (lobbyCode, difficulty) => {
        lobbyGame[lobbyCode] = gameController.newMultiPlayerGame(difficulty);
    },

    getGameOfLobby: (lobbyCode) => {
        if (!lobbyGame[lobbyCode]) {
            console.log("Lobby not found for code: " + lobbyCode);
            return null;
        }
        console.log("Game " + JSON.stringify(lobbyGame[lobbyCode]));
        console.log("sudoku " + JSON.stringify(lobbyGame[lobbyCode].sudoku));
        console.log("vite " + lobbyGame[lobbyCode].vite);
        return lobbyGame[lobbyCode];
    },

    newMultiPlayerGame: (difficulty)  => {
        return new Game(difficulty);
    },

    insertNumberMulti: (cellData, lobbyCode) => {
        // recupero il gioco e chiamo l insert
        const game = gameController.getGameOfLobby(lobbyCode);
        const result = game.insertNumber(cellData.row, cellData.col, cellData.value);

        if (result === undefined) {

            return ({
                puzzle: game.sudoku.puzzle,
                solution: game.sudoku.solution,
                vite: game.vite,
                message: 'Hai vinto!',
                gameOver: true,
            });
        }

        if (result === 'Hai perso! Vite terminate.') {
            return ({
                puzzle: game.sudoku.puzzle,
                solution: game.sudoku.solution,
                vite: game.vite,
                message: result,
                gameOver: true,
            });
        }

        return ({
            puzzle: game.sudoku.puzzle,
            cellData: cellData,
            vite: game.vite,
            message: result,
            gameOver: false,
        });
    },


    // Endpoint per inserire un numero in una cella
    insertNumber: (req, res) => {
        const { gameId, row, col, value } = req.body;
        const currentGame = activeGames[gameId];
        if (!currentGame) {
            return res.status(404).json({ error: 'Partita non trovata' });
        }

        const result = currentGame.insertNumber(row, col, value);

        if (result === undefined) {
            delete activeGames[gameId];
            return res.status(200).json({
                puzzle: currentGame.sudoku.puzzle,
                solution: currentGame.sudoku.solution,
                vite: currentGame.vite,
                message: 'Hai vinto!',
                gameOver: true,
            });
        }

        if (result === 'Hai perso! Vite terminate.') {
            delete activeGames[gameId];
            return res.status(200).json({
                puzzle: currentGame.sudoku.puzzle,
                solution: currentGame.sudoku.solution,
                vite: currentGame.vite,
                message: result,
                gameOver: true,
            });
        }

        return res.status(200).json({
            puzzle: currentGame.sudoku.puzzle,
            vite: currentGame.vite,
            message: result,
            gameOver: false,
        });
    },
};

module.exports = gameController;