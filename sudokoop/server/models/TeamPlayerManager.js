const playerManager = require("./LobbyPlayerManager");

class TeamPlayerManager {
    // inizializzo i team con tutti i player della lobby: in questo modo vedo
    // se i giocatori aggiunti appartenevano effettivamente alla lobby e faccio
    // controllo per iniziare un game (tutti i giocatori hanno scelto una squadra)
    constructor(lobbyCode) {
        this.yellowTeam = [];
        this.blueTeam = [];
        this.lobbyCode = lobbyCode;
        //allPlayers serve solo durante la scelta iniziate dei team per capire quando tutti hanno scelto
        this.allPlayers = [...playerManager.getPlayersOfLobby(lobbyCode)];
    }

    removePlayerFromTeam(username) {
        const team = this.yellowTeam.some(p => p.username === username) ? this.yellowTeam : this.blueTeam;
        this.removeIfPresent(username, team);
        this.removeFromAllPlayersList(username);
        return {
            yellowTeam: this.yellowTeam,
            blueTeam: this.blueTeam
        }
    }

    findTeam(username) {
        return this.yellowTeam.some(p => p.username === username) ? this.yellowTeam : this.blueTeam;
    }

    getTeams() {
        return {
            yellowTeam: this.yellowTeam,
            blueTeam: this.blueTeam
        }
    }

    setPlayerAsEliminated(username) {
        this.findTeam(username).find(p => p.username === username).username = username + "-eliminated";
    }

    // chiamato durante la fase di gioco (quando abbandoni)
    removePlayerFromGame(username) {
        this.removePlayerFromTeam(username)
        this.setMaster(playerManager.removePlayer(this.lobbyCode, username));
    }

    setMaster(master) {
        if (master) {
            const team = this.findTeam(master.username);
            team.find(p => p.username === master.username).isMaster = true;
        }
    }

    addPlayerToTeam(player, color) {
        const targetTeam = color === 'yellow' ? this.yellowTeam : this.blueTeam;
        const otherTeam = color === 'yellow' ? this.blueTeam : this.yellowTeam;
        this.removeIfPresent(player.username, otherTeam)
        this.removeFromAllPlayersList(player.username);
        if (!targetTeam.some(p => p.username === player.username)) {
            targetTeam.push(player);
        }

        return {
            yellowTeam: this.yellowTeam,
            blueTeam: this.blueTeam
        }
    }

    removeIfPresent(username, team) {
        if (team.some(p => p.username === username)) {
            const index = team.findIndex(user => user.username === username);
            if (index !== -1) {
                team.splice(index, 1);
            }
        }
    }

    removeFromAllPlayersList(username) {
        this.allPlayers = this.allPlayers.filter(p => p.username !== username);
    }

    checkVersusGameCanStart() {
        if (this.allPlayers.length !== 0) {
            return {res: false, message: "Tutti i giocatori devono scegliere una squadra"};
        }
        if (this.yellowTeam.length < 1 || this.blueTeam.length < 1) {
            return {res: false, message: "Ogni squadra deve avere almeno un giocatore"}
        }
        return {res: true}
    }

    restorePlayer() {
        this.yellowTeam.forEach(p => p.username = p.username.replace('-eliminated', ''))
        this.blueTeam.forEach(p => p.username = p.username.replace('-eliminated', ''))
    }
}

module.exports = TeamPlayerManager;