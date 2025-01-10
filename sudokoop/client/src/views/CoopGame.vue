
<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';
import GameMulti from './GameMulti.vue';
export default {
  name: 'CoopGame',
  components: { SudokuGrid, GameMulti },
  data() {
    return {
      sudokuGrid: "",
      vite: 0,
      isInitialized: false,
    };
  },

  mounted() {
    socket.emit('getGame', sessionStorage.getItem('lobbyCode'));
    socket.on("game", (data) => {
      const { sudoku, vite } = data;
      this.sudokuGrid = sudoku;
      this.vite = vite;
      this.isInitialized = true;
    })
  },
};
</script>

<style scoped>

</style>
<template>
  <GameMulti v-if="this.isInitialized" :initialVite ="vite" :puzzle="sudokuGrid"></GameMulti>
</template>
