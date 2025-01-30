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

    findLobbyOfUser(username) {
        return this.lobbies.find(l =>
            playerManager.getPlayersOfLobby(l.code).some(p => p.username === username)
        );
    }
    joinLobby(code, username) {
        const lobby = this.findLobby(code);
        if (!lobby) return {success: false, reason: "not-exist"};
        if (playerManager.lobbyPlayers[code].length >= 10) {
            return {success: false, reason: "full"};
        }
        // Se già presente, nessun problema
        if (playerManager.lobbyPlayers[code].find((p) => p.username === username)) {
            return {success: true};
        }
        // Aggiunge come non-master
        playerManager.addPlayerToLobby(code, new Player(username, false))
        return {success: true};
    }

    getPlayersOfLobby(code) {
        const lobby = this.findLobby(code);
        if (!lobby) return [];
        // Invece di .map(...) restituisco l'intero array di obj
        return playerManager.getPlayersOfLobby(code);
    }

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


