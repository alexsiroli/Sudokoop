const sudokuGen = require('sudoku-gen');

class Game {
    constructor(difficult) {
        console.log("sono in game " + difficult)
        this.sudoku = sudokuGen.getSudoku(difficult);
        this.emptyPlace = this.sudoku.puzzle.match(/-/g).length;
        this.gameOver = false;
        this.win = false;
    }
    insertNumberWithoutCheck(row, col, num) {
        const index = row * 9 + col;
        console.log("inserting number without chek " + row + col + num)
        return this.sudoku.puzzle.substring(0, index) + num + this.sudoku.puzzle.substring(index + 1);
    }
    // Metodo per inserire un numero in una cella
    insertNumber(row, col, num) {
        let message;
        const index = row * 9 + col; // Calcola l'indice corrispondente nella stringa puzzle
        // Verifica se il numero inserito è corretto
        if (this.sudoku.solution[index] === num.toString()) {
            // Aggiorna la stringa puzzle per mostrare il numero inserito
            this.sudoku.puzzle =
                this.sudoku.puzzle.substring(0, index) + num + this.sudoku.puzzle.substring(index + 1);
            this.emptyPlace--;
            if (this.emptyPlace === 0) {
                this.gameOver = true;
                this.win = true;
                message = 'Hai vinto!';
            } else {
                message = 'Giusto!';
            }
        } else {
            message = 'Sbagliato! Riprova.';
        }
        return {
            win: this.win,
            puzzle: this.sudoku.puzzle,
            solution: this.sudoku.solution,
            message: message,
            gameOver: this.gameOver
        }
    }
}

module.exports = Game;