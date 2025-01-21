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
        this.eliminated = ""; //conserva il nome dell'ultimo giocatore eliminato
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
        return false;
    }

    // Metodo per inserire un numero in una cella
    insertNumber(row, col, num, username) {
        const result = this.game.insertNumber(row, col, num);
        const team = this.findTeam(username)
        if (result === "Giusto!") {
            team.points++;
            return result;
        }
        if (result === "Hai vinto!") {
            team.points++;
            this.eliminated = "";
            // sudoku finito: vince la squadra con i punti piu alti
            if (this.yellow.points > this.blue.points) {
                return 'Gialla vince!';
            } else if (this.yellow.points === this.blue.points) {
                return 'Pareggio!';
            } else {
                return 'Blu vince!';
            }
        }
        if (result === 'Sbagliato! Riprova.') {
            team.team = team.team.filter(player => player.username !== username);
            this.eliminated = username;
            return this.checkForFinish(result) === false ? result : this.checkForFinish(result);
        }
        return result; // Restituisci il risultato originale per gli altri casi
    }
}

// Esporta la classe Game con module.exports
module.exports = VersusGame;