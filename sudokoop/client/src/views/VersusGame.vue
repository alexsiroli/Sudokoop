<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';
import GameVersus from './GameVersus.vue';

export default {
  name: 'VersusGame',
  components: {SudokuGrid, GameVersus},
  data() {
    return {
      sudokuGrid: "",
      isInitialized: false,
      difficulty: "",
      yellowTeam: [],
      blueTeam: [],
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
        const {sudoku, difficulty, yellowTeam, blueTeam} = data;
        this.sudokuGrid = sudoku;
        this.isInitialized = true;
        this.difficulty = difficulty;
        this.yellowTeam = yellowTeam;
        this.blueTeam = blueTeam;
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
  <GameVersus v-if="this.isInitialized" :puzzle="sudokuGrid" :difficulty="this.difficulty"
             :yellowTeam ="this.yellowTeam" :blueTeam="this.blueTeam"
             :restartNewGame = "restartNewGame"></GameVersus>
</template>
