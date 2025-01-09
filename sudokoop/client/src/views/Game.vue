<template>
  <div class="centered-container">
    <div class="rounded-box game-container">
      <button @click="goToHome" class="back-button" title="Torna alla Home">&#8592;</button>
      <h1 class="title">Gioco Singolo - Difficoltà: {{ difficulty }}</h1>
      <div v-if="gameOver" class="game-over-container">
        <p class="game-over-message">{{ gameOverMessage }}</p>
        <button @click="startNewGame" class="button new-game-button">Inizia una Nuova Partita</button>
      </div>
      <div v-else class="game-content">
        <div class="lives-container">
          <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>
        </div>
        <div class="sudoku-container">
          <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
        </div>
        <div class="message-container">
          <p>{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "../main.js";
import SudokuGrid from "../components/SudokuGrid.vue";

export default {
  name: "Game",
  components: {SudokuGrid},
  data() {
    return {
      gameId: null,
      sudokuGrid: [],
      vite: 3,
      message: "",
      gameOver: false,
      gameOverMessage: "",
      difficulty: "easy",
    };
  },
  computed: {
    hearts() {
      return "❤️".repeat(this.vite);
    },
  },
  methods: {
    async startNewGame() {
      this.gameOver = false;
      this.gameOverMessage = "";
      this.message = "";
      this.vite = 3;
      this.sudokuGrid = [];
      this.gameId = null;

      try {
        // Richiesta GET per avviare una nuova partita in Single Player
        const response = await axios.get(`/game/new?difficulty=${this.difficulty}`);
        const data = response.data;
        this.gameId = data.gameId;
        this.vite = data.vite;
        this.initializeGrid(data.puzzle);
      } catch (error) {
        console.error("Errore nella creazione della partita:", error);
      }
    },
    async handleCellUpdate(cellData) {
      if (!this.gameId) return;
      try {
        // Richiesta POST per inserire un numero nella cella
        const response = await axios.post("/game/insert", {
          gameId: this.gameId,
          row: cellData.row,
          col: cellData.col,
          value: cellData.value,
        });
        const data = response.data;
        this.message = data.message || "";
        this.vite = data.vite;
        this.initializeGrid(data.puzzle);
        if (data.gameOver) {
          this.gameOver = true;
          this.gameOverMessage = data.message || "Partita terminata.";
        }
      } catch (error) {
        console.error("Errore nell'inserimento del numero:", error);
      }
    },
    initializeGrid(puzzle) {
      this.sudokuGrid = [];
      for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;
          const char = puzzle[index];
          row.push({
            value: char === "-" ? "" : char,
            readOnly: char !== "-",
          });
        }
        this.sudokuGrid.push(row);
      }
    },
    goToHome() {
      this.$router.push("/home");
    },
  },
  mounted() {
    const diff = this.$route.query.difficulty;
    if (["easy", "medium", "hard"].includes(diff)) {
      this.difficulty = diff;
    }
    this.startNewGame();
  },
};
</script>

<style scoped>
.game-over-message {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
}

.hearts {
  font-size: 1.5em;
}

.message-container {
  font-size: 1.1em;
  margin-top: 10px;
}
</style>
