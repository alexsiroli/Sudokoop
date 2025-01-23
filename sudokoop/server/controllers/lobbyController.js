const playerManager = require("../models/LobbyPlayerManager");
const Player = require("../models/Player");



class LobbyController {

    constructor() {
        this.lobbies = [];
    }

    generateLobbyCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    createLobby(masterUsername) {
        const code = this.generateLobbyCode();
        const newLobby = new Lobby(code);
        playerManager.addPlayerToLobby(code, new Player(masterUsername, true));
        this.lobbies.push(newLobby);
        return newLobby;
    }

    findLobby(code) {
        return this.lobbies.find((l) => l.code === code);
    }

    joinLobby(code, username) {
        const lobby = this.findLobby(code);
        if (!lobby) return { success: false, reason: "not-exist" };
        if (playerManager.lobbyPlayers[code].length >= 10) {
            return { success: false, reason: "full" };
        }
        // Se già presente, nessun problema
        if (playerManager.lobbyPlayers[code].find((p) => p.username === username)) {
            return { success: true };
        }
        // Aggiunge come non-master
        playerManager.addPlayerToLobby(code, new Player(username, false))
        return { success: true };
    }


/*
    emptyTeam (lobbyCode) {
        if (this.lobbyTeams[lobbyCode]) {
            this.lobbyTeams[lobbyCode] = {
                yellowTeam: [],
                blueTeam: [],
            };
        }
    }




    getTeams(lobbyCode) {
       return gameController.getGameOfLobby(lobbyCode).getTeams();
    }

 */


/*    createNewVersusGame (lobbyCode, difficulty) {
        GameController.createVersusGame(lobbyCode, new VersusGame(difficulty,
            this.lobbyTeams[lobbyCode].yellowTeam, this.lobbyTeams[lobbyCode].blueTeam));
    }

    isVersusGame(lobbyCode) {
        return GameController.getGameOfLobby(lobbyCode) instanceof VersusGame;
    }

 */



    getPlayersOfLobby(code) {
        const lobby = this.findLobby(code);
        if (!lobby) return [];
        // Invece di .map(...) restituisco l'intero array di obj
        return playerManager.getPlayersOfLobby(code);
    }

    /*getPlayerFromUsername(code, username) {
        return this.findLobby(code).players.find(p => p.username === username);
    }

     */

    isMaster(code, username) {
        const lobby = this.findLobby(code);
        if (!lobby) return false;

        return playerManager.getMasterOfLobby(code).username === username;
    }

    removePlayerFromLobby(code, username) {
        const lobby = this.findLobby(code);
        if (!lobby) return;
        playerManager.removePlayer(code, username);
        if (playerManager.getPlayersOfLobby(code).length === 0) {
            this.removeLobby(lobby.code);
        }
    }

    removeLobby(code) {
        this.lobbies = this.lobbies.filter((l) => l.code !== code);
    }
}

module.exports = LobbyController;

class Lobby {
    constructor(code) {
        this.code = code;
    }
}


