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
        console.log("rimuovo " + username)
        this.lobbyPlayers[lobbyCode].forEach(player => {console.log("giuocatore " + player.username)})
        this.lobbyPlayers[lobbyCode] = this.lobbyPlayers[lobbyCode].filter(player => !player.username.startsWith(username));
        console.log("nuova lista player nel lobby ",  this.lobbyPlayers[lobbyCode])
        //assegna nuovo master se necessario
        if (this.lobbyPlayers[lobbyCode].length < 1) {
            console.log("non ci sono player in lobby")
            return [];
        }
        const masterPlayer = this.lobbyPlayers[lobbyCode].some(player => player.isMaster);
        if (!masterPlayer && this.lobbyPlayers[lobbyCode].length > 0) {
            console.log("assegno nuovo master")
            const master = this.lobbyPlayers[lobbyCode][0];
            master.isMaster = true;
            console.log(master.username)
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
