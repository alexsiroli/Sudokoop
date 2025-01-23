// classe che gestisce i giocatori di un unico coop game
const playerManager = require("./LobbyPlayerManager");

class CoopPlayerManager {
    constructor(lobbyCode) {
        this.gamePlayers = [...playerManager.getPlayersOfLobby(lobbyCode)];
        this.lobbyCode = lobbyCode;
    }

    removePlayer(username) {
        this.gamePlayers = this.gamePlayers.filter(player => player.username !== username);
        //TODO: gestire il caso zero giocatori
        this.setMaster(playerManager.removePlayer(this.lobbyCode, username));
        //assegna nuovo master se necessario

    }
    setMaster(master) {
        this.gamePlayers.find(p => p.username === master.username).isMaster = true;
    }

    getPlayers() {
        return this.gamePlayers;
    }
}
module.exports = CoopPlayerManager;