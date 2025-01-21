const Game = require("./Game");

class GameWithVite extends Game {

    constructor(difficult) {
        super(difficult);
        this.vite = 3;
    }

    // Metodo per inserire un numero in una cella
    insertNumber(row, col, num) {
        const result = super.insertNumber(row, col, num);
        if (result.message === 'Sbagliato! Riprova.') {
            this.vite--;
            if (this.vite === 0) {
                this.gameOver = true;
                result.message = 'Hai perso! Vite terminate.'; // Gioco terminato
            }
        }
        result.gameOver = this.gameOver;
        result.vite = this.vite;
        return result;
    }
}

module.exports = GameWithVite;