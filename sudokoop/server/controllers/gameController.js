const Game = require('../models/Game');

// Mappa in memoria per associare gameId alle istanze di Game
const activeGames = {};

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