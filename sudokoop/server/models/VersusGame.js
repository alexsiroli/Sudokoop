const Game = require("./Game");

class VersusGame {
    constructor(difficult, yellowTeam, blueTeam) {
        this.game = new Game(difficult);
        this.yellow = {
            team: yellowTeam, points: 0
        };
        this.blue = {
            team: blueTeam, points: 0
        }
    }

    getTeams() {
        return {
            yellowTeam: this.yellow.team, blueTeam: this.blue.team
        }
    }

    getPlayers() {
        return this.yellow.team.concat(this.blue.team);
    }

    findTeam(username) {
        return this.yellow.team.some(p => p.username === username) ? this.yellow : this.blue;
    }

    removePlayer(username) {
        const team = this.findTeam(username);
        team.team = team.team.filter(player => player.username !== username);
        return this.checkForFinish();
    }

    checkForFinish() {
        if (this.yellow.team.length === 0) {
            this.gameOver = true;
            return 'Blu vince!'; // Gioco terminato
        }
        if (this.blue.team.length === 0) {
            this.gameOver = true;
            return 'Gialla vince!';
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
        }
        else if (result.message === "Hai vinto!") {
            team.points++;
            // sudoku finito: vince la squadra con i punti piu alti
            if (this.yellow.points > this.blue.points) {
                 message = 'Gialla vince!';
            } else if (this.yellow.points === this.blue.points) {
                message = 'Pareggio!';
            } else {
                message = 'Blu vince!';
            }
            result.message = message;
        }
        else if (result.message === 'Sbagliato! Riprova.') {
            team.team = team.team.filter(player => player.username !== username);
            result.message = this.checkForFinish(result) === "" ? result.message : this.checkForFinish(result);
        }
        result.yellowPoint = this.yellow.points;
        result.bluePoint = this.blue.points;
        result.yellowTeam = this.yellow.team;
        result.blueTeam = this.blue.team;
        return result; // Restituisci il risultato originale per gli altri casi
    }
}

// Esporta la classe Game con module.exports
module.exports = VersusGame;