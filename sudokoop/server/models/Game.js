const sudokuGen = require('sudoku-gen');

class Game {
    constructor(difficult) {
        this.sudoku = sudokuGen.getSudoku(difficult);
        this.emptyPlace = this.sudoku.puzzle.match(/-/g).length;
        this.gameOver = false;
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
                this.gameOver = true;
                return 'Hai vinto!';
            }

            return 'Giusto!';
        } else {
            return 'Sbagliato! Riprova.';
        }
    }
}

module.exports = Game;