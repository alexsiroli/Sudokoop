const sudokuGen = require('sudoku-gen');

class Game {
    constructor(difficolta) {
        this.sudoku = sudokuGen.getSudoku('easy');
        this.emptyPlace = this.sudoku.puzzle.match(/-/g).length;
        this.vite = 3;  // Imposta le vite iniziali a 3
    }


    // Metodo per stampare la griglia del puzzle
    printBoard(showEmpty = false) {
        const puzzle = this.sudoku.puzzle; // La stringa del puzzle (81 caratteri)
        const boardToPrint = [];
        console.log("Posti da riempire: " + this.emptyPlace);
        // Suddividiamo la stringa in righe da 9 caratteri
        for (let i = 0; i < 9; i++) {
            const row = [];
            for (let j = 0; j < 9; j++) {
                const char = puzzle[i * 9 + j]; // Otteniamo il carattere dalla stringa

                // Sostituiamo i '-' (cella vuota) con un valore visibile se showEmpty è false
                row.push(char === '-' ? (showEmpty ? '-' : '_') : char);
            }
            boardToPrint.push(row);
        }

        // Stampa la griglia con spazi tra i numeri e con divisioni visibili per blocchi 3x3
        for (let i = 0; i < 9; i++) {
            if (i > 0 && i % 3 === 0) {
                console.log('------+-------+------'); // Linea divisoria tra blocchi
            }

            console.log(
                boardToPrint[i]
                    .slice(0, 3).join(' ') + ' | ' +
                boardToPrint[i].slice(3, 6).join(' ') + ' | ' +
                boardToPrint[i].slice(6).join(' ')
            );
        }
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

// Esporta la classe Game con module.exports
module.exports = Game;