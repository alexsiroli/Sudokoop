const Game = require("./Game");

class VersusGame extends Game {
    constructor(difficult, yellowTeam, blueTeam) {
        super(difficult, yellowTeam + blueTeam);
        this.yellow =
            {team: yellowTeam,
            points: 0};
        this.blue =  {
            team: blueTeam,
            points: 0
        }
        this.eliminated = "";
    }

    getPlayers() {
        return this.yellow.team.concat(this.blue.team);
    }
    findTeam(username) {
        return this.yellow.team.username.includes(username) ? this.yellow : this.blue;
    }

    removePlayer(username) {
        const team = this.findTeam(username);
        console.log("rimuovo da VERSUS game ")
        team.team = team.team.filter(player => player.username !== username);
        console.log("Yellow " + this.yellow.team)
        console.log("Blue " + this.blue.team)
    }
    // Metodo per inserire un numero in una cella
    insertNumber(row, col, num, username) {
        const result = super.insertNumber(row, col, num);
        const team = this.findTeam(username)
        if (result === "Giusto!") {
            team.points ++;
            return result;
        }
        if (result === "Hai vinto!") {
            team.points ++;
            this.eliminated = "";
            // sudoku finito: vince la squadra con i punti piu alti
            if (this.yellow.points > this.blue.points) {
                return 'Gialla vince!';
            }
            else {
                return 'Blu vince!';
            }
        }
        if (result === 'Sbagliato! Riprova.') {
            team.team = team.team.filter(player => player.username !== username);
            console.log("YEllow" + this.yellow.team);
            console.log("Blue " + this.blue.team);
            this.eliminated = username;
            if (this.yellow.team.length === 0) {
                this.gameOver = true;
                return 'Blu vince!'; // Gioco terminato
            }
            if (this.blue.team.length === 0) {
                this.gameOver = true;
                return 'Gialla vince!';
            }
        }

        return result; // Restituisci il risultato originale per gli altri casi

    }
}

// Esporta la classe Game con module.exports
module.exports = VersusGame;