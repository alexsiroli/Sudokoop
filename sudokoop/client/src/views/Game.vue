<template>
  <div class="centered-container">
    <div class="rounded-box game-container">
      <button @click="goToHome" class="back-button" title="Torna alla Home">&#8592;</button>
      <h1 class="title">Gioco Singolo - Difficoltà: {{ difficulty }}</h1>
      <div v-if="gameOver" class="game-over-container">
        <p class="game-over-message">{{ gameOverMessage }}</p>
        <button @click="startNewGame" class="button new-game-button">Inizia una Nuova Partita</button>
      </div>
      <div v-else class="game-content">
        <div class="lives-container">
          <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>
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
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';

export default {
  name: 'Game',
  components: { SudokuGrid },
  data() {
    return {
      sudokuGrid: [],
      vite: 3,
      message: '',
      gameOver: false,
      gameOverMessage: '',
      difficulty: 'easy',
    };
  },
  computed: {
    hearts() {
      const fullHeart = '❤️'; // Cuore rosso
      return fullHeart.repeat(this.vite);
    },
  },
  methods: {
    startNewGame() {
      this.gameOver = false;
      this.gameOverMessage = '';
      this.message = '';
      this.vite = 3;
      this.sudokuGrid = [];
      socket.emit('startGame', this.difficulty);
    },
    handleCellUpdate(cellData) {
      socket.emit('cellUpdate', cellData);
    },
    initializeGrid(puzzle) {
      this.sudokuGrid = [];
      for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;
          const char = puzzle[index];
          row.push({
            value: char === '-' ? '' : char,
            readOnly: char !== '-',
          });
        }
        this.sudokuGrid.push(row);
      }
    },
    goToHome() {
      this.$router.push('/home');
    },
},
  mounted() {
    const diff = this.$route.query.difficulty;
    if (['easy', 'medium', 'hard'].includes(diff)) {
      this.difficulty = diff;
    }
    this.startNewGame();

    socket.on('gameData', (data) => {
      this.vite = data.vite;
      this.initializeGrid(data.puzzle);
    });

    socket.on('cellResult', (data) => {
      this.message = data.message;
      this.vite = data.vite;
      this.initializeGrid(data.puzzle);
    });

    socket.on('gameWon', (message) => {
      this.gameOver = true;
      this.gameOverMessage = message;
    });

    socket.on('gameOver', (message) => {
      this.gameOver = true;
      this.gameOverMessage = message;
    });
  },
  beforeUnmount() {
    socket.off('gameData');
    socket.off('cellResult');
    socket.off('gameWon');
    socket.off('gameOver');
  },
};
</script>

<style scoped>
.game-over-message {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
}

.hearts {
  font-size: 1.5em;
}

.message-container {
  font-size: 1.1em;
  margin-top: 10px;
}
</style>
