class LobbyPlayerManager {
    constructor() {
        this.lobbyPlayers = [];
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
        //assegna nuovo master se necessario
        const masterPlayer = this.lobbyPlayers[lobbyCode].some(player => player.isMaster);
        if (!masterPlayer && this.lobbyPlayers[lobbyCode].length > 0) {
            const master = this.lobbyPlayers[lobbyCode][0];
            master.isMaster = true;
            return master;
        }
        return this.lobbyPlayers[lobbyCode].find(player => player.isMaster);
    }


    getPlayersOfLobby(lobbyCode) {
       return this.lobbyPlayers[lobbyCode];
    }

    getMasterOfLobby(lobbyCode) {
        return this.lobbyPlayers[lobbyCode].find((p) => p.isMaster);
    }

}

const playerManager = new LobbyPlayerManager();
module.exports = playerManager;
