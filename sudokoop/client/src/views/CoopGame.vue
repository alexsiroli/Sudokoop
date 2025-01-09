
<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';

export default {
  name: 'CoopGame',
  components: { SudokuGrid },
  data() {
    return {
      sudokuGrid: [],
      vite: 0,
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
  created() {

    socket.emit('getGame');
    socket.on("game", (data) => {
      this.sudokuGrid = data.sudoku;
      console.log("sudoku  " + this.sudoku)
      this.vite = data.vite;
      console.log("vite " + this.vite);
    })


  },
};
</script>

<style scoped>

</style>
<template>
  <div class="centered-container">
    <div class="rounded-box coop-game-container">
      <button class="back-button" @click="goBack" title="Torna alla Lobby">&#8592;</button>
      <h1 class="title">Coop Game</h1>
      <div class="lives-container">
        <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>
      </div>
      <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
    </div>
  </div>
</template>
