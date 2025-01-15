const Game = require("./Game");

class GameWithVite extends Game {

  constructor(difficult) {
    super(difficult);
    this.vite = 3;  // Imposta le vite iniziali a 3
  }

  // Metodo per inserire un numero in una cella
  insertNumber(row, col, num) {
    const result = super.insertNumber(row, col, num); // Chiama il metodo della classe padre

    if (result === 'Sbagliato! Riprova.') {
      this.vite--; // Riduci le vite
      if (this.vite === 0) {
        this.gameOver = true;
        return 'Hai perso! Vite terminate.'; // Gioco terminato
      }
    }

    return result; // Restituisci il risultato originale per gli altri casi
  }
}

// Esporta la classe GameWithVite con module.exports
module.exports = GameWithVite;