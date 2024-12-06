<template>
  <div class="game-container-wrapper">
    <div class="game-container">
      <button @click="goToHome" class="home-button back-arrow" title="Torna alla Home">&#8592;</button>
      <h1>Gioco Singolo</h1>
      <!-- Mostra messaggio di fine partita se il gioco è terminato -->
      <div v-if="gameOver" class="game-over-container">
        <p class="game-over-message">{{ gameOverMessage }}</p>
        <button @click="startNewGame" class="new-game-button">Inizia una Nuova Partita</button>
      </div>
      <!-- Mostra la griglia del Sudoku se il gioco è ancora in corso -->
      <div v-else class="game-content">
        <div class="lives-container">
          <p>Vite rimanenti: <span class="lives-count">{{ vite }}</span></p>
        </div>
        <div class="sudoku-container">
          <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
        </div>
        <div class="message-container">
          <p>{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importa il componente della griglia Sudoku
import SudokuGrid from '../components/SudokuGrid.vue';
// Importa il socket per la comunicazione con il server
import socket from '../plugins/socket.js';

export default {
  name: 'Game',
  components: {
    SudokuGrid,
  },
  data() {
    return {
      sudokuGrid: [], // Dati della griglia del Sudoku
      vite: 3, // Numero di vite rimanenti per il giocatore
      message: '', // Messaggio informativo per il giocatore
      gameOver: false, // Stato del gioco (true se terminato)
      gameOverMessage: '', // Messaggio di fine partita
    };
  },
  methods: {
    startNewGame() {
      // Inizia una nuova partita
      this.gameOver = false;
      this.gameOverMessage = '';
      this.message = '';
      this.vite = 3;
      this.sudokuGrid = [];

      // Invia l'evento al server per iniziare una nuova partita
      socket.emit('startGame', 'easy'); // Puoi permettere al giocatore di scegliere la difficoltà
    },
    handleCellUpdate(cellData) {
      // Invia l'aggiornamento della cella al server
      socket.emit('cellUpdate', cellData);
    },
    initializeGrid(puzzle) {
      // Converte la stringa del puzzle in una griglia
      this.sudokuGrid = [];
      for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;
          const char = puzzle[index];
          row.push({
            value: char === '-' ? '' : char, // Imposta il valore della cella
            readOnly: char !== '-', // Le celle precompilate sono di sola lettura
          });
        }
        this.sudokuGrid.push(row);
      }
    },
    goToHome() {
      window.location.href = 'http://localhost:8080/';
    },
  },
  mounted() {
    // Inizia una nuova partita quando il componente è montato
    this.startNewGame();

    // Riceve i dati iniziali del gioco dal server
    socket.on('gameData', (data) => {
      this.vite = data.vite; // Imposta il numero di vite
      this.initializeGrid(data.puzzle); // Inizializza la griglia con il puzzle ricevuto
    });

    // Riceve il risultato dell'inserimento
    socket.on('cellResult', (data) => {
      this.message = data.message; // Aggiorna il messaggio informativo
      this.vite = data.vite; // Aggiorna il numero di vite
      this.initializeGrid(data.puzzle); // Aggiorna la griglia
    });

    // Gestisce la vittoria
    socket.on('gameWon', (message) => {
      this.gameOver = true; // Imposta lo stato del gioco come terminato
      this.gameOverMessage = message; // Imposta il messaggio di vittoria
    });

    // Gestisce la sconfitta
    socket.on('gameOver', (message) => {
      this.gameOver = true; // Imposta lo stato del gioco come terminato
      this.gameOverMessage = message; // Imposta il messaggio di sconfitta
    });
  },
  beforeUnmount() {
    // Rimuove gli ascoltatori degli eventi per evitare memory leaks
    socket.off('gameData');
    socket.off('cellResult');
    socket.off('gameWon');
    socket.off('gameOver');
  },
};
</script>

<style scoped>
/***** Stili per la pagina di gioco *****/
.game-container-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.game-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 3px solid #000;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  background-color: #f9f9f9;
  text-align: center;
}

.home-button {
  margin-right: 10px;
  padding: 5px;
  font-size: 1.5em;
  cursor: pointer;
  border: none;
  background: none;
}

.back-arrow {
  margin-right: 10px;
  padding: 5px;
  font-size: 1.5em;
  cursor: pointer;
  border: none;
  background: none;
}

.game-over-container {
  margin-top: 20px;
}

.game-over-message {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
}

.new-game-button {
  padding: 10px 20px;
  font-size: 1.2em;
  cursor: pointer;
  border: 2px solid #000;
  border-radius: 5px;
  background-color: #fff;
}

.game-content {
  margin-top: 20px;
}

.lives-container {
  margin-bottom: 20px;
  font-size: 1.2em;
}

.lives-count {
  font-weight: bold;
}

.sudoku-container {
  margin-bottom: 20px;
}

.message-container {
  font-size: 1.1em;
  margin-top: 10px;
}
</style>
