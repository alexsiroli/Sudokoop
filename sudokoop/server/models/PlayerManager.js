class PlayerManager {
    constructor() {
        this.lobbyPlayers = [];
        this.gamePlayers = [];
    }

    addPlayerToLobby(lobbyCode, player) {
        if (!this.lobbyPlayers[lobbyCode]) {
            this.lobbyPlayers[lobbyCode] = [];
        }
        this.lobbyPlayers[lobbyCode].push(player);
    }

    removePlayer(lobbyCode, username) {
        // rimuovi dalla lobby
        this.lobbyPlayers[lobbyCode] = this.lobbyPlayers[lobbyCode].filter(player => player.username !== username);
        if (this.gamePlayers[lobbyCode]) {
            this.gamePlayers[lobbyCode] = this.gamePlayers[lobbyCode].filter(player => player.username !== username);
        }
        //assegna nuovo master se necessario
        const masterPlayer = this.lobbyPlayers[lobbyCode].some(player => player.isMaster);
        if (!masterPlayer && this.lobbyPlayers[lobbyCode].length > 0) {
            this.setMaster(lobbyCode);
        }
    }

    setMaster(lobbyCode) {
        const master = this.lobbyPlayers[lobbyCode][0];
        master.isMaster = true;
        if (this.gamePlayers[lobbyCode]) {
            this.gamePlayers[lobbyCode].find(p => p.username === master.username).isMaster = true;
        }
    }

    getPlayersOfLobby(lobbyCode) {
        return this.lobbyPlayers[lobbyCode];
    }

    getPlayersOfGame(lobbyCode) {
        if (!this.gamePlayers[lobbyCode]) {
            this.gamePlayers[lobbyCode] = [...this.lobbyPlayers[lobbyCode]];
        }
        return this.gamePlayers[lobbyCode];
    }
    getMasterOfLobby(lobbyCode) {
        return this.lobbyPlayers[lobbyCode].find((p) => p.isMaster);
    }

}

const playerManager = new PlayerManager();
module.exports = playerManager;
