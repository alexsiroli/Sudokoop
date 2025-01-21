const Game = require("./Game");

class GameWithVite extends Game {

    constructor(difficult) {
        super(difficult);
        this.vite = 3;
    }

    // Metodo per inserire un numero in una cella
    insertNumber(row, col, num) {
        const result = super.insertNumber(row, col, num);
        if (result === 'Sbagliato! Riprova.') {
            this.vite--;
            if (this.vite === 0) {
                this.gameOver = true;
                return 'Hai perso! Vite terminate.'; // Gioco terminato
            }
        }
        return result;
    }
}

module.exports = GameWithVite;