<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';
import GameMulti from './GameMulti.vue';

export default {
  name: 'VersusGame',
  components: {SudokuGrid, GameMulti},
  data() {
    return {
      sudokuGrid: "",
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
      socket.emit('getVersusGame', sessionStorage.getItem('lobbyCode'))
      socket.on("game", (data) => {
        const {sudoku, difficulty} = data;
        this.sudokuGrid = sudoku;
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
  <GameMulti v-if="this.isInitialized" :puzzle="sudokuGrid" :difficulty="this.difficulty"
             :restartNewGame = "restartNewGame"></GameMulti>
</template>
