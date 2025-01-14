const Game = require("./Game");

class VersusGame extends Game {
    constructor(difficult, yellowTeam, blueTeam) {
        super(difficult);
        this.yellowTeam = yellowTeam;
        this.blueTeam = blueTeam;
    }


    // Metodo per inserire un numero in una cella
    insertNumber(row, col, num, username) {
        const result = super.insertNumber(row, col, num);
        if (result === 'Sbagliato! Riprova.') {
            this.yellowTeam = this.yellowTeam.filter(player => player !== username);

            // Rimuovi il giocatore dalla squadra blu, se presente
            this.blueTeam = this.blueTeam.filter(player => player !== username);

            console.log("blueTeam", this.blueTeam);
            console.log("yellowTeam", this.yellowTeam);
            if (this.yellowTeam.length === 0) {
                return 'Blu vince!'; // Gioco terminato
            }
            if (this.blueTeam.length === 0) {
                return 'Giallo vince!';
            }
        }

        return result; // Restituisci il risultato originale per gli altri casi

    }
}

// Esporta la classe Game con module.exports
module.exports = VersusGame;