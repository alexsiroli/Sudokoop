// server/src/controllers/gameController.js
const Game = require('../models/GameWithVite');
const VersusGame = require('../models/VersusGame');

const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User'); // Import del modello User

// Mappa in memoria per associare gameId alle istanze di Game
const activeGames = {};
const lobbyGame = {};
const lobbyTeams = {}
const gameController = {

    // Salva il tempo su DB
    saveTime: async (req, res) => {
        const { username, milliseconds, difficulty } = req.body;
        if (!username || !milliseconds) {
            return res.status(400).json({ error: "Dati insufficienti" });
        }
        try {
            // Crea un nuovo record Leaderboard e salva
            const record = new Leaderboard({
                username,
                milliseconds,
                difficulty
            });
            await record.save();

            return res.status(200).json({ message: "Tempo salvato su DB" });
        } catch (err) {
            console.error("Errore salvataggio tempo:", err);
            return res.status(500).json({ error: "Errore interno nel salvataggio" });
        }
    },

    // Recupera la leaderboard dal DB
    getLeaderboard: async (req, res) => {
        try {
            // Trova tutti i record, ordina per tempo crescente
            const records = await Leaderboard.find().sort({ milliseconds: 1 });
            res.status(200).json(records);
        } catch (err) {
            console.error("Errore recupero leaderboard:", err);
            res.status(500).json({ error: "Errore nel recupero della leaderboard" });
        }
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

    createNewGame: (lobbyCode, difficulty) => {
        lobbyGame[lobbyCode] = gameController.newMultiPlayerGame(difficulty);
    },

    addPlayerToTeam: (lobbyCode, color, username) => {
        if (!lobbyTeams[lobbyCode]) {
            lobbyTeams[lobbyCode] = {
                yellowTeam: [],
                blueTeam: [],
            };
        }
        switch (color) {
            case "yellow":
                lobbyTeams[lobbyCode].yellowTeam.push(username)
                break;
            case "blue":
                lobbyTeams[lobbyCode].blueTeam.push(username)
                break;
        }
    },
    getGameOfLobby: (lobbyCode) => {

        if (!lobbyGame[lobbyCode]) {
            console.log("Lobby not found for code: " + lobbyCode);
            return null;
        }
        console.log("Game " + JSON.stringify(lobbyGame[lobbyCode]));
        console.log("sudoku " + JSON.stringify(lobbyGame[lobbyCode].sudoku));
        //console.log("vite " + lobbyGame[lobbyCode].vite);
        return lobbyGame[lobbyCode];
    },
    createVersusGame: (lobbyCode, difficulty) => {
        console.log("creo un nuovo gioco con squadre ");
        console.log("yellow " + lobbyTeams[lobbyCode].yellowTeam)
        console.log("blue " + lobbyTeams[lobbyCode].blueTeam)
        lobbyGame[lobbyCode] = new VersusGame(difficulty,
            lobbyTeams[lobbyCode].yellowTeam, lobbyTeams[lobbyCode].blueTeam);
    },

    newMultiPlayerGame: (difficulty)  => {
        return new Game(difficulty);
    },
    insertNumberWithoutCheck: (cellData, lobbyCode) => {
        const game = gameController.getGameOfLobby(lobbyCode);
        return game.insertNumberWithoutCheck(cellData.row, cellData.col, cellData.value);
    },

    insertNumberMulti: (cellData, lobbyCode) => {
        // recupero il gioco e chiamo l insert
        const game = gameController.getGameOfLobby(lobbyCode);
        const result = game.insertNumber(cellData.row, cellData.col, cellData.value);

        if (result === undefined) {

            return ({
                puzzle: game.sudoku.puzzle,
                solution: game.sudoku.solution,
                cellData: cellData,
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

    // Endpoint per aggiornare vittorie o sconfitte
    updateStats: async (req, res) => {
        const { username, result } = req.body;
        if (!username || !result) {
            return res.status(400).json({ error: "Dati insufficienti" });
        }
        try {
            // Se result è "win", incrementiamo wins, altrimenti losses
            const update = result === "win" ? { $inc: { wins: 1 } } : { $inc: { losses: 1 } };
            const user = await User.findOneAndUpdate({ userName: username }, update, { new: true });
            if (!user) {
                return res.status(404).json({ error: "Utente non trovato" });
            }
            return res.status(200).json({ message: "Statistiche aggiornate" });
        } catch (err) {
            console.error("Errore aggiornamento statistiche:", err);
            return res.status(500).json({ error: "Errore interno" });
        }
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

    generateGameId: () => {
        return `game_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    },
};

module.exports = gameController;