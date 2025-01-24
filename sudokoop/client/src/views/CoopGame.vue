<script>
import socket from '../plugins/socket.js';
import GameMulti from './GameMulti.vue';

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
      this.isInitialized = false;
      this.getGameData();
    },

    getGameData() {
      socket.emit('getCoopGame', sessionStorage.getItem('lobbyCode'))
      socket.on("game", (data) => {
        const {sudoku, vite, difficulty} = data;
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

      <GameMulti v-if="this.isInitialized" :puzzle="sudokuGrid" :changeVite="changeVite"
                 :restartNewGame="restartNewGame"></GameMulti>
    </div>
  </div>

</template>
