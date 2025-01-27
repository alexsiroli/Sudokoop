<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import socket from '../plugins/socket.js';
import GameVersus from './GameVersus.vue';
import GameMulti from './Multiplayer.vue';

export default {
  name: 'VersusGame',
  components: {GameMulti},
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

      //faccio richiesta per nuovo gioco e torno indietro (sono il master)
      socket.emit('createVersusGame',
        {
          lobbyCode: sessionStorage.getItem('lobbyCode'),
          difficulty: this.difficulty
        });
      socket.emit("startVersusGame", sessionStorage.getItem('lobbyCode'));

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
  <GameMulti v-if="this.isInitialized" :puzzle="sudokuGrid" :difficulty="this.difficulty"
             :yellowTeam ="this.yellowTeam" :blueTeam="this.blueTeam"
             :restartNewGame = "restartNewGame"></GameMulti>
</template>
