<script>
import socket from '../plugins/socket.js';
import GameMulti from '../components/Multiplayer.vue';

export default {
  name: 'CoopGame',
  components: {GameMulti},

  data() {
    return {
      sudokuGrid: "",
      vite: 0,
      isInitialized: false,
      difficulty: "",
    };
  },

  computed: {
    hearts() {
      return "❤️".repeat(this.vite);
    },
  },

  methods: {
    changeVite(newVite) {
      this.vite = newVite;
    },

    restartNewGame() {
      // Se sono il master, creo il gioco
      //faccio richiesta per nuovo gioco e torno indietro (sono il master)
      socket.emit("startCoopGame", sessionStorage.getItem('lobbyCode'));
      socket.emit('checkMultiGameStart',
        {
          lobbyCode: sessionStorage.getItem('lobbyCode'),
          mode: 'coop',
          difficulty: this.difficulty,
        });
    },

    getGameData() {
      this.isInitialized = false;
      console.log("getting coop game ")
      socket.emit('getCoopGame', sessionStorage.getItem('lobbyCode'))
      socket.on("game", (data) => {
        console.log("data " + data)
        const {sudoku, vite, difficulty} = data;
        console.log("vite  " + vite)
        this.sudokuGrid = sudoku;
        this.vite = vite;
        this.difficulty = difficulty;
        this.isInitialized = true;
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

  <div class="centered-container">

    <div class="rounded-box game-container">
      <h1 class="title">Gioco Multiplayer Coop</h1>
      <h3>Difficoltà: {{ this.difficulty }}</h3>
      <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>

      <GameMulti v-if="this.isInitialized" :puzzle="sudokuGrid" :mode="'coop'" :changeVite="changeVite"
                 :color="'gray'" :restartNewGame="restartNewGame" :getGameData="getGameData"></GameMulti>
    </div>
  </div>

</template>
