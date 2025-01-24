const GameWithVite = require('../models/GameWithVite');
const VersusGame = require('../models/VersusGame');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const CoopGame = require("../models/CoopGame"); // Import del modello User
const TeamPlayerManager = require("../models/TeamPlayerManager");
const lobbyPlayerManager = require("../models/LobbyPlayerManager");
class GameController {
    constructor() {
        // Stato interno
        this.activeGames = {};
        this.lobbyGame = [];
        this.lobbyTeams = [];
    }

    // Genera un ID univoco per il gioco
    generateGameId() {
        return `game_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

    // Salva il tempo su DB
    async saveTime(req, res) {
        const {username, milliseconds, difficulty} = req.body;
        if (!username || !milliseconds) {
            return res.status(400).json({error: "Dati insufficienti"});
        }
        try {
            const record = new Leaderboard({username, milliseconds, difficulty});
            await record.save();
            return res.status(200).json({message: "Tempo salvato su DB"});
        } catch (err) {
            console.error("Errore salvataggio tempo:", err);
            return res.status(500).json({error: "Errore interno nel salvataggio"});
        }
    }

    // Recupera la leaderboard dal DB
    async getLeaderboard(req, res) {
        try {
            const records = await Leaderboard.find().sort({milliseconds: 1});
            res.status(200).json(records);
        } catch (err) {
            console.error("Errore recupero leaderboard:", err);
            res.status(500).json({error: "Errore nel recupero della leaderboard"});
        }
    }

    // Avvia una nuova partita single-player
    newSinglePlayerGame(req, res) {
        const difficulty = req.query.difficulty || 'easy';
        const gameId = this.generateGameId();
        const newGame = new GameWithVite(difficulty);
        this.activeGames[gameId] = newGame;

        return res.status(200).json({
            gameId,
            puzzle: newGame.sudoku.puzzle,
            vite: newGame.vite,
        });
    }

    // chiamato nel momento in cui i giocatori scelgono modalità versus
    // e devono dividersi in squadre
    createTeamManager(lobbyCode) {
        this.lobbyTeams[lobbyCode] = new TeamPlayerManager(lobbyCode);
    }

    // Aggiunge un giocatore a un team
    addPlayerToTeam(lobbyCode, color, player) {
        if (this.lobbyTeams[lobbyCode]) {
            return this.lobbyTeams[lobbyCode].addPlayerToTeam(player, color);
        }
    }

    removePlayerFromTeam(lobbyCode, player) {
        if (this.lobbyTeams[lobbyCode]) {
            return this.lobbyTeams[lobbyCode].removePlayerFromTeam(player);
        }
    }



    coopGameCanStart(lobbyCode) {
        if (lobbyPlayerManager.getPlayersOfLobby(lobbyCode).length < 2) {
            return {res: false, message: "Devono esserci almeno 2 giocatori per iniziare la partita"}
        }
        console.log("coop game can start")
        return {res: true};
    }

    versusGameCanStart(lobbyCode) {
        return this.lobbyTeams[lobbyCode].checkVersusGameCanStart();
    }

    // Crea una nuova partita multiplayer
    createCoopGame(lobbyCode, difficulty) {
        console.log("Creating coopGame")
        this.lobbyGame[lobbyCode] = new CoopGame(difficulty, lobbyCode);
    }

    createVersusGame(lobbyCode, difficulty) {
        this.lobbyGame[lobbyCode] = new VersusGame(difficulty, this.lobbyTeams[lobbyCode]);
        this.lobbyTeams[lobbyCode] = null;
    }

    // Rimuove un giocatore da una partita
    removePlayerFromGame(lobbyCode, username) {
        this.lobbyGame[lobbyCode]?.removePlayer(username);
    }

    // Recupera i giocatori di una partita
    getPlayersOfGame(lobbyCode) {
        return this.lobbyGame[lobbyCode]?.getPlayers();
    }

    getTeamsOfGame(lobbyCode) {
        return this.lobbyGame[lobbyCode]?.getTeams();
    }

    removeGame(lobbyCode) {
        this.lobbyGame[lobbyCode] = null;
    }

    // Recupera il gioco associato a una lobby
    getGameOfLobby(lobbyCode) {
        const game = this.lobbyGame[lobbyCode];
        if (!game) {
            console.log("Lobby not found for code: " + lobbyCode);
            return null;
        }
        return game;
    }

    // Inserisce un numero senza controlli
    insertNumberWithoutCheck(cellData, lobbyCode) {
        const game = this.getGameOfLobby(lobbyCode);
        return game.insertNumberWithoutCheck(cellData.row, cellData.col, cellData.value);
    }

    // Inserisce un numero in modalità multiplayer
    insertNumberMulti(cellData, lobbyCode, username) {
        const game = this.getGameOfLobby(lobbyCode);
        const result = game.insertNumber(cellData.row, cellData.col, cellData.value, username);
        result.cellData = cellData;
        return result;
    }

    /*
        // Rimuove un gioco
        removeGame(lobbyCode) {
            this.lobbyGame[lobbyCode] = null;
        }
    */

    // Aggiorna le statistiche di un utente
    async updateStats(req, res) {
        const {username, result} = req.body;
        if (!username || !result) {
            return res.status(400).json({error: "Dati insufficienti"});
        }
        try {
            const update = result === "win" ? {$inc: {wins: 1}} : {$inc: {losses: 1}};
            const user = await User.findOneAndUpdate({userName: username}, update, {new: true});
            if (!user) {
                return res.status(404).json({error: "Utente non trovato"});
            }
            return res.status(200).json({message: "Statistiche aggiornate"});
        } catch (err) {
            console.error("Errore aggiornamento statistiche:", err);
            return res.status(500).json({error: "Errore interno"});
        }
    }

    // Inserisce un numero in modalità single-player
    insertNumber(req, res) {
        const {gameId, row, col, value} = req.body;
        const currentGame = this.activeGames[gameId];
        if (!currentGame) {
            return res.status(404).json({error: 'Partita non trovata'});
        }

        const result = currentGame.insertNumber(row, col, value);

        if (result === undefined) {
            delete this.activeGames[gameId];
            return res.status(200).json({
                puzzle: currentGame.sudoku.puzzle,
                solution: currentGame.sudoku.solution,
                vite: currentGame.vite,
                message: 'Hai vinto!',
                gameOver: true,
            });
        }

        if (result === 'Hai perso! Vite terminate.') {
            delete this.activeGames[gameId];
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
    }
}


module.exports = GameController;
