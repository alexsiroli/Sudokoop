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


        // TODO: Se c'è un gioco, rimuovilo da li


        //assegna nuovo master se necessario
        const masterPlayer = this.lobbyPlayers[lobbyCode].some(player => player.isMaster);
        if (!masterPlayer && this.lobbyPlayers[lobbyCode].length > 0) {
            this.lobbyPlayers[lobbyCode][0].isMaster = true;
        }
    }
    getPlayersOfLobby(lobbyCode) {
        return this.lobbyPlayers[lobbyCode];
    }

    getMasterOfLobby(lobbyCode) {
        return this.lobbyPlayers[lobbyCode].find((p) => p.isMaster);
    }

}

const playerManager = new PlayerManager();
module.exports = playerManager;
