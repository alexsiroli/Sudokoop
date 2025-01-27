const Game = require("./Game");

class VersusGame {
    constructor(difficult, teamPlayerManager) {
        console.log("CREATING VERSIS GAME")
        this.game = new Game(difficult);
        this.teamPlayerManager = teamPlayerManager;
        this.yellow = {
            team: this.teamPlayerManager.getTeams().yellowTeam, points: 0
        };
        this.blue = {
            team: this.teamPlayerManager.getTeams().blueTeam, points: 0
        }
    }

    getTeams() {
        return {
            yellowTeam: this.yellow.team, blueTeam: this.blue.team
        }
    }

    getTeamsPoint() {
        return {
            yellowPoint: this.yellow.points,
            bluePoint: this.blue.points
        }
    }

    getPlayers() {
        return this.yellow.team.concat(this.blue.team);
    }

    findTeam(username) {
        return this.yellow.team.some(p => p.username === username) ? this.yellow : this.blue;
    }

    removePlayer(player) {
        this.teamPlayerManager.removePlayerFromGame(player)
        return this.checkForFinish();
    }

    checkForFinish() {
        if (this.yellow.team.length === 0) {
            this.gameOver = true;
            return 'Squadra Blu vince!'; // Gioco terminato
        }
        if (this.blue.team.length === 0) {
            this.gameOver = true;
            return 'Squadra Gialla vince!';
        }
        return "";
    }

    insertNumberWithoutCheck(row, col, num) {
        this.game.insertNumberWithoutCheck(row, col, num);
    }

    // Metodo per inserire un numero in una cella
    insertNumber(row, col, num, username) {
        const result = this.game.insertNumber(row, col, num);
        const team = this.findTeam(username)
        let message = "";

        if (result.message === "Giusto!") {
            team.points++;
        } else if (result.message === "Hai vinto!") {
            team.points++;
            // sudoku finito: vince la squadra con i punti piu alti
            if (this.yellow.points > this.blue.points) {
                message = 'Squadra Gialla vince!';
            } else if (this.yellow.points === this.blue.points) {
                message = 'Pareggio!';
            } else {
                message = 'Squadra Blu vince!';
            }
            result.message = message;
        } else if (result.message === 'Sbagliato! Riprova.') {
            // setto un giocatore come eliminato
            this.teamPlayerManager.setPlayerAsEliminated(username);
            result.message = this.checkForFinish(result) === "" ? result.message : this.checkForFinish(result);
        }
        result.yellowPoint = this.yellow.points;
        result.bluePoint = this.blue.points;
        // TODO: devi ritornare i team con eliminated
        result.yellowTeam = this.yellow.team;
        result.blueTeam = this.blue.team;
        result.color = team === this.yellow ? 'yellow' : 'blue';
        return result; // Restituisci il risultato originale per gli altri casi
    }
}

// Esporta la classe Game con module.exports
module.exports = VersusGame;