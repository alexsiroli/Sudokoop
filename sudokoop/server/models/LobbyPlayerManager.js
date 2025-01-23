const TeamManager = require("./TeamsManager");

class LobbyPlayerManager {
    constructor() {
        this.lobbyPlayers = [];
        this.teamPlayers = [];
    }

    addPlayerToLobby(lobbyCode, player) {
        if (!this.lobbyPlayers[lobbyCode]) {
            this.lobbyPlayers[lobbyCode] = [];
        }
        this.lobbyPlayers[lobbyCode].push(player);
    }
    createTeams(lobbyCode) {
        if (this.lobbyPlayers[lobbyCode]) {
            this.teamPlayers = new TeamManager(this.lobbyPlayers[lobbyCode]);
        }
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
