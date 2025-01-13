<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';
import GameMulti from './GameMulti.vue';

export default {
  name: 'CoopGame',
  components: {SudokuGrid, GameMulti},
  data() {
    return {
      sudokuGrid: "",
      vite: 0,
      isInitialized: false,
      difficulty: "",
    };
  },
  methods: {
    restartNewGame() {
      this.isInitialized = false;
      this.getGameData();
    },
    getGameData() {
      socket.emit('getGame', sessionStorage.getItem('lobbyCode'))
      socket.on("game", (data) => {
        const {sudoku, vite, difficulty} = data;
        this.sudokuGrid = sudoku;
        this.vite = vite;
        this.isInitialized = true;
        this.difficulty = difficulty;
      })
    }
  },
  mounted() {
    this.getGameData();
  },
};
</script>

<style scoped>

</style>
<template>
   <GameMulti v-if="this.isInitialized" :initialVite="vite" :puzzle="sudokuGrid" :difficulty="this.difficulty"
   :restartNewGame = "restartNewGame"></GameMulti>
</template>
