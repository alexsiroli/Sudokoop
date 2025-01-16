const VersusGame = require("../models/VersusGame");
const GameController = require("./gameController");
class LobbyController {
    constructor() {
        this.lobbies = [];
        this.lobbyTeams = [];
    }

    generateLobbyCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    createLobby(masterUsername) {
        const code = this.generateLobbyCode();
        const newLobby = new Lobby(code, masterUsername);
        this.lobbies.push(newLobby);
        return newLobby;
    }

    findLobby(code) {
        return this.lobbies.find((l) => l.code === code);
    }

    joinLobby(code, username) {
        const lobby = this.findLobby(code);
        if (!lobby) return { success: false, reason: "not-exist" };
        if (lobby.players.length >= 10) {
            return { success: false, reason: "full" };
        }
        // Se già presente, nessun problema
        if (lobby.players.find((p) => p.username === username)) {
            return { success: true };
        }
        // Aggiunge come non-master
        lobby.players.push({ username, isMaster: false });
        return { success: true };
    }

    emptyTeam (lobbyCode) {
        if (this.lobbyTeams[lobbyCode]) {
            this.lobbyTeams[lobbyCode] = {
                yellowTeam: [],
                blueTeam: [],
            };
        }
    }

    addPlayerToTeam (lobbyCode, color, username) {
        if (!this.lobbyTeams[lobbyCode]) {
            this.lobbyTeams[lobbyCode] = {
                yellowTeam: [],
                blueTeam: [],
            };
        }
        switch (color) {
            case "yellow":
                if (this.lobbyTeams[lobbyCode].blueTeam.includes(username)) {
                    this.lobbyTeams[lobbyCode].blueTeam = this.lobbyTeams[lobbyCode].blueTeam.filter(user => user !== username);
                }
                if (!this.lobbyTeams[lobbyCode].yellowTeam.includes(username)) {
                    this.lobbyTeams[lobbyCode].yellowTeam.push(username)
                }
                break;
            case "blue":
                if (this.lobbyTeams[lobbyCode].yellowTeam.includes(username)) {
                    this.lobbyTeams[lobbyCode].yellowTeam = this.lobbyTeams[lobbyCode].yellowTeam.filter(user => user !== username);
                }
                if (!this.lobbyTeams[lobbyCode].blueTeam.includes(username)) {
                    this.lobbyTeams[lobbyCode].blueTeam.push(username)
                }
                break;
        }
        return {
            yellowTeam: this.lobbyTeams[lobbyCode].yellowTeam,
            blueTeam: this.lobbyTeams[lobbyCode].blueTeam,
        }
    }

    versusGameCanStart (lobbyCode) {
        return this.lobbyTeams[lobbyCode].yellowTeam.length > 0 && this.lobbyTeams[lobbyCode].blueTeam.length > 0;
    }

    createNewVersusGame (lobbyCode, difficulty) {
        GameController.createVersusGame(lobbyCode, new VersusGame(difficulty,
            this.lobbyTeams[lobbyCode].yellowTeam, this.lobbyTeams[lobbyCode].blueTeam));
    }

    removePlayer(code, username) {
        const lobby = this.findLobby(code);
        if (!lobby) return;
        lobby.players = lobby.players.filter(p => p.username !== username);
        // Se la lobby ora è vuota, rimuoviamo la lobby
        if (lobby.players.length === 0) {
            GameController.removeGame(code);
            this.removeLobby(code);
        } else {
            // Se manca il master, assegna a uno a caso
            const masterStillPresent = lobby.players.some(p => p.isMaster);
            if (!masterStillPresent && lobby.players.length > 0) {
                lobby.players[0].isMaster = true;
            }
        }
    }

    getPlayersOfLobby(code) {
        const lobby = this.findLobby(code);
        if (!lobby) return [];
        // Invece di .map(...) restituisco l'intero array di obj
        console.log("Lista di gioca" + lobby.players);
        return lobby.players;
    }

    isMaster(code, username) {
        const lobby = this.findLobby(code);
        if (!lobby) return false;
        const player = lobby.players.find((p) => p.username === username);
        return player ? player.isMaster : false;
    }

    handleDisconnect(username) {
        const lobby = this.lobbies.find((l) =>
          l.players.some((p) => p.username === username)
        );
        if (!lobby) return;
        lobby.players = lobby.players.filter((p) => p.username !== username);
        if (lobby.players.length === 0) {
            this.removeLobby(lobby.code);
            return;
        }
        const masterStillPresent = lobby.players.some((p) => p.isMaster);
        if (!masterStillPresent && lobby.players.length > 0) {
            lobby.players[0].isMaster = true;
        }
    }

    removeLobby(code) {
        this.lobbies = this.lobbies.filter((l) => l.code !== code);
    }
}

module.exports = LobbyController;

class Lobby {
    constructor(code, masterUsername) {
        this.code = code;
        this.players = [
            { username: masterUsername, isMaster: true }
        ];
    }
}
