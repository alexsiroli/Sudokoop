class LobbyController {
    constructor() {
        this.lobbies = [];
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

    getPlayersOfLobby(code) {
        const lobby = this.findLobby(code);
        if (!lobby) return [];
        // Invece di .map(...) restituisco l'intero array di obj
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
