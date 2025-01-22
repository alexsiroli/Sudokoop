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
        lobby.players.push(new Player(username, false));
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
        return lobby.players;
    }

    /*getPlayerFromUsername(code, username) {
        return this.findLobby(code).players.find(p => p.username === username);
    }

     */

    isMaster(code, username) {
        const lobby = this.findLobby(code);
        if (!lobby) return false;
        const player = lobby.players.find((p) => p.username === username);
        return player ? player.isMaster : false;
    }

    removePlayerFromLobby(username) {
        const lobby = this.lobbies.find((l) =>
          l.players.some((p) => p.username === username)
        );
        if (!lobby) return;
        lobby.removePlayer(username);
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
        this.players = [new Player(masterUsername, true)];
    }
    removePlayer(username) {
        this.players = this.players.filter(player => player.username !== username);

    }
}

class Player {
    constructor(username, isMaster) {
        this.username = username;
        this.isMaster = isMaster;
    }
}

