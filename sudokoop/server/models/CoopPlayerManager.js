// classe che gestisce i giocatori di un unico coop game
const playerManager = require("./LobbyPlayerManager");

class CoopPlayerManager {
    constructor(lobbyCode) {
        this.gamePlayers = [...playerManager.getPlayersOfLobby(lobbyCode)];
        this.lobbyCode = lobbyCode;
    }

    removePlayer(username) {
        console.log("removing " + username + " from coopGame")
        this.gamePlayers = this.gamePlayers.filter(p => p.username !== username);
        this.setMaster(playerManager.removePlayer(this.lobbyCode, username));

    }

    setMaster(master) {

        if (master && this.gamePlayers.length > 0) {
            console.log("coop game " + master.username)
            this.gamePlayers.find(p => p.username === master.username).isMaster = true;
        }
    }

    getPlayers() {
        return this.gamePlayers;
    }
}

module.exports = CoopPlayerManager;