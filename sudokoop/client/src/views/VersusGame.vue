<template>
  <div class="centered-container">
    <div class="rounded-box versus-game-container">
      <button class="back-button" @click="goBack" title="Torna alla Lobby">&#8592;</button>
      <h1 class="title">Versus Game</h1>
      <div class="teams-lives">
        <p>Vite Squadra A: <span class="hearts">{{ heartsA }}</span></p>
        <p>Vite Squadra B: <span class="hearts">{{ heartsB }}</span></p>
      </div>
      <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
    </div>
  </div>
</template>

<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';

export default {
  name: 'VersusGame',
  components: { SudokuGrid },
  data() {
    return {
      sudokuGrid: [],
      viteA: 3,
      viteB: 3,
    };
  },
  computed: {
    heartsA() {
      return '❤️'.repeat(this.viteA);
    },
    heartsB() {
      return '❤️'.repeat(this.viteB);
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
    // Logica per iniziare la partita versus
  },
};
</script>

<style scoped>

</style>
