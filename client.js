// Importa la libreria Socket.IO per il client
const { io } = require("socket.io-client");
const readline = require('readline');

// Crea l'interfaccia per la lettura da console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Connessione al server
const socket = io("http://localhost:3000");

// Quando il client si connette al server
socket.on("connect", () => {
    console.log("Connesso al server!");

    // Funzione per inviare messaggi
    function sendMessage() {
        rl.question("Inserisci la cella e il numero da inviare: ", (message) => {
            if (message.toLowerCase() === "exit") {
                console.log("Chiusura del client...");
                rl.close();
                socket.disconnect();
                return;
            }

            // Invia il messaggio al server
            socket.emit("insert", message);

            // Continua a chiedere nuovi messaggi
            sendMessage();
        });
    }

    // Avvia la lettura di messaggi da riga di comando
    sendMessage();
});

// Riceve messaggi dal server
socket.on("message", (msg) => {
    console.log("Messaggio ricevuto dal server:", msg);
});
socket.on("sudoku", (msg) => {
    console.log("Sudoku:", msg);
});
// Gestisce la disconnessione
socket.on("disconnect", () => {
    console.log("Disconnesso dal server.");
    rl.close(); // Chiudi l'interfaccia di lettura quando il server si disconnette
});
