// classe che gestisce i giocatori di un unico coop game
const playerManager = require("./LobbyPlayerManager");

class CoopPlayerManager {
    constructor(lobbyCode) {
        this.gamePlayers = [...playerManager.getPlayersOfLobby(lobbyCode)];
        this.lobbyCode = lobbyCode;
    }

    removePlayer(username) {
        this.gamePlayers = this.gamePlayers.filter(p => p.username !== username);
        if (this.gamePlayers.length > 0) {
            this.setMaster(playerManager.removePlayer(this.lobbyCode, username));
        }
    }

    setMaster(master) {
        this.gamePlayers.find(p => p.username === master.username).isMaster = true;
    }

    getPlayers() {
        return this.gamePlayers;
    }
}

module.exports = CoopPlayerManager;