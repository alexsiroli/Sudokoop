import Game from './game.js';
import readline from 'readline';

// Crea l'interfaccia per la lettura da console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Crea un oggetto di gioco con una difficoltà
let game = new Game('medio');

// Funzione per visualizzare la griglia
function printBoard() {
    console.log("\nGriglia di gioco:");
    game.printBoard();  // Stampa la griglia con celle vuote nascoste
    console.log("Vite rimaste " + game.vite);
    console.log("\nInserisci il numero nel formato: 'riga colonna numero' (ad esempio: '2 3 5')");
}

// Funzione per gestire l'inserimento del numero
function promptUser() {
    printBoard();

    rl.question('Inserisci la tua mossa: ', (input) => {
        const inputParts = input.split(' ');

        if (inputParts.length !== 3) {
            console.log('Formato non valido. Usa "riga colonna numero"');
            return promptUser();
        }

        const row = parseInt(inputParts[0]) - 1;  // Converti la riga a indice 0-based
        const col = parseInt(inputParts[1]) - 1;  // Converti la colonna a indice 0-based
        const num = parseInt(inputParts[2]);

        // Controlla che l'input sia valido
        if (isNaN(row) || isNaN(col) || isNaN(num) || row < 0 || row >= 9 || col < 0 || col >= 9 || num < 1 || num > 9) {
            console.log('Input non valido. Riprova.');
            return promptUser();
        }

        // Inserisci il numero nel gioco
        const result = game.insertNumber(row, col, num);

        console.log(result);

        if (result === 'Gioco completato! Hai vinto!') {
            rl.close();
            return;
        } else if (result === 'Hai perso! Vite terminate.') {
            rl.close();
            return;
        } else {
            promptUser();
        }
    });
}

// Avvia il gioco
promptUser();