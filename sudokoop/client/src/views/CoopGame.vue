<template>
  <div class="centered-container">
    <div class="rounded-box coop-game-container">
      <button class="back-button" @click="goBack" title="Torna alla Lobby">&#8592;</button>
      <h1 class="title">Coop Game ({{ $route.query.difficulty }})</h1>
      <div class="lives-container">
        <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>
      </div>
      <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
    </div>
  </div>
</template>

<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';

export default {
  name: 'CoopGame',
  components: { SudokuGrid },
  data() {
    return {
      sudokuGrid: [],
      vite: 3,
    };
  },
  computed: {
    hearts() {
      const fullHeart = '❤️';
      return fullHeart.repeat(this.vite);
    },
  },
  methods: {
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
    goBack() {
      this.$router.push({ name: 'Lobby' });
    },
  },
  mounted() {
    // Logica per ricevere puzzle e vite (simile a Game.vue)
    // socket.on('gameData', ...)
  },
};
</script>

<style scoped>
.lives-container {
  margin-bottom: 20px;
  font-size: 1.2em;
  font-weight: bold;
}

.hearts {
  font-size: 1.5em;
}
</style>
