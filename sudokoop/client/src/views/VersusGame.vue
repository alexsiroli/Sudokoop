<script>
import socket from '../plugins/socket.js';
import GameMulti from '../components/Multiplayer.vue';

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
      color: "",
    };
  },
  methods: {
    restartNewGame() {
      // check
      socket.emit("checkRestartVersusGame",
        { lobbyCode: sessionStorage.getItem('lobbyCode'),
          difficulty: this.difficulty,
        });
    },
    getGameData() {
      this.isInitialized = false;
      socket.emit('getVersusGame', sessionStorage.getItem('lobbyCode'))
    }
  },
  beforeUnmount() {
    socket.off("versusGame");
  },
  mounted() {
    this.getGameData();
    socket.on("versusGame", (data) => {
      const {sudoku, difficulty, yellowTeam, blueTeam} = data;
      this.sudokuGrid = sudoku;

      this.difficulty = difficulty;
      this.yellowTeam = yellowTeam;
      this.blueTeam = blueTeam;
      this.color = this.yellowTeam.some(p => p.username === sessionStorage.getItem('username')) ? 'yellow' : 'blue';
      this.isInitialized = true;
    });
    socket.on("backToTeamSelection", () => {
      this.$router.push({name: 'SelectTeamVersusGame'});
    })
  },

};
</script>

<template>
  <div class="centered-container">

    <div class="rounded-box game-container">
      <h1 class="title">Gioco Multiplayer Versus</h1>
      <h3>Difficoltà: {{ this.difficulty }}</h3>
      <GameMulti v-if="this.isInitialized" :puzzle="sudokuGrid"
                 :mode="'versus'" :color="color" :yellowTeam="this.yellowTeam" :blueTeam="this.blueTeam"
                 :getGameData="getGameData" :restartNewGame="restartNewGame"></GameMulti>
    </div>
  </div>
</template>
