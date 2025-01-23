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

    removePlayerFromTeam(player) {
        const team = this.yellowTeam.some(p => p.username === player.username) ? this.yellowTeam : this.blueTeam;
        this.removeIfPresent(player, team);
        this.removeFromAllPlayersList(player);
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

    // chiamato durante la fase di gioco (quando abbandoni)
    removePlayerFromGame(player) {
        this.removePlayerFromTeam(player)
        this.setMaster(playerManager.removePlayer(this.lobbyCode, player.username));
    }

    setMaster(master) {
        const team = this.findTeam(master.username);
        team.find(p => p.username === master.username).isMaster = true;
    }

    addPlayerToTeam(player, color) {
        const targetTeam = color === 'yellow' ? this.yellowTeam : this.blueTeam;
        const otherTeam = color === 'yellow' ? this.blueTeam : this.yellowTeam;
        this.removeIfPresent(player, otherTeam)
        this.removeFromAllPlayersList(player);
        targetTeam.push(player);
        return {
            yellowTeam: this.yellowTeam,
            blueTeam: this.blueTeam
        }
    }

    removeIfPresent(player, team) {
        if (team.includes(player)) {
            const index = team.findIndex(user => user.username === player.username);
            if (index !== -1) {
                team.splice(index, 1);
            }
        }
    }

    removeFromAllPlayersList(player) {
        this.allPlayers = this.allPlayers.filter(p => p.username !== player.username);
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

}

module.exports = TeamPlayerManager;