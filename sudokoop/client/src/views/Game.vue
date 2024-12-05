<template>
  <div>
    <h1>Gioco Singolo</h1>
    <div v-if="gameOver">
      <p>{{ gameOverMessage }}</p>
      <button @click="startNewGame">Inizia una Nuova Partita</button>
    </div>
    <div v-else>
      <p>Vite rimanenti: {{ vite }}</p>
      <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';

export default {
  name: 'Game',
  components: {
    SudokuGrid,
  },
  data() {
    return {
      sudokuGrid: [],
      vite: 3,
      message: '',
      gameOver: false,
      gameOverMessage: '',
    };
  },
  methods: {
    startNewGame() {
      this.gameOver = false;
      this.gameOverMessage = '';
      this.message = '';
      this.vite = 3;
      this.sudokuGrid = [];

      // Invia l'evento al server per iniziare una nuova partita
      socket.emit('startGame', 'easy'); // Puoi permettere al giocatore di scegliere la difficoltà
    },
    handleCellUpdate(cellData) {
      // Invia l'aggiornamento al server
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
            value: char === '-' ? '' : char,
            readOnly: char !== '-', // Le celle precompilate sono readOnly
          });
        }
        this.sudokuGrid.push(row);
      }
    },
  },
  mounted() {
    // Inizia una nuova partita quando il componente è montato
    this.startNewGame();

    // Riceve i dati iniziali del gioco dal server
    socket.on('gameData', (data) => {
      this.vite = data.vite;
      this.initializeGrid(data.puzzle);
    });

    // Riceve il risultato dell'inserimento
    socket.on('cellResult', (data) => {
      this.message = data.message;
      this.vite = data.vite;
      // Aggiorna la griglia
      this.initializeGrid(data.puzzle);
    });

    // Gestisce la vittoria
    socket.on('gameWon', (message) => {
      this.gameOver = true;
      this.gameOverMessage = message;
    });

    // Gestisce la sconfitta
    socket.on('gameOver', (message) => {
      this.gameOver = true;
      this.gameOverMessage = message;
    });
  },
  beforeUnmount() {
    // Rimuove gli ascoltatori degli eventi
    socket.off('gameData');
    socket.off('cellResult');
    socket.off('gameWon');
    socket.off('gameOver');
  },
};
</script>

<style scoped>
/* Stili per la pagina di gioco */
</style>
