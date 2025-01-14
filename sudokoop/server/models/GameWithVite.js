const sudokuGen = require('sudoku-gen');

class GameWithVite {
  constructor(difficult) {
    this.sudoku = sudokuGen.getSudoku(difficult);
    this.emptyPlace = this.sudoku.puzzle.match(/-/g).length;
    this.vite = 3;  // Imposta le vite iniziali a 3
  }

  insertNumberWithoutCheck(row, col, num) {
    const index = row * 9 + col;
    return this.sudoku.puzzle.substring(0, index) + num + this.sudoku.puzzle.substring(index + 1);
  }

  // Metodo per inserire un numero in una cella
  insertNumber(row, col, num) {
    const index = row * 9 + col; // Calcola l'indice corrispondente nella stringa puzzle

    // Verifica che la posizione sia valida e corrisponda a una cella vuota
    if (this.sudoku.puzzle[index] !== '-') {
      return 'Posizione non valida: la cella non è vuota.';
    }

    // Verifica se il numero inserito è corretto
    if (this.sudoku.solution[index] === num.toString()) {
      // Aggiorna la stringa puzzle per mostrare il numero inserito
      this.sudoku.puzzle =
        this.sudoku.puzzle.substring(0, index) + num + this.sudoku.puzzle.substring(index + 1);

      this.emptyPlace--;
      if (this.emptyPlace === 0) {
        console.log("Hai vinto!!");
        return;
      }

      return 'Giusto!';
    } else {
      // Riduce il numero di vite
      this.vite--;

      // Se non ci sono più vite, il gioco è terminato
      if (this.vite === 0) {
        return 'Hai perso! Vite terminate.';
      }

      return 'Sbagliato! Riprova.';
    }
  }
}

// Esporta la classe GameWithVite con module.exports
module.exports = GameWithVite;