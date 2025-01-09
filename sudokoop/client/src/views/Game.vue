<template>
  <div class="centered-container">
    <div class="rounded-box game-container">
      <button @click="goToHome" class="back-button" title="Torna alla Home">&#8592;</button>
      <h1 class="title">Gioco Singolo - Difficoltà: {{ difficulty }}</h1>

      <!-- Se il gioco è finito e l'utente ha perso, mostra il messaggio sopra la griglia -->
      <div v-if="gameOver && gameOverMessage.startsWith('Hai perso')" class="game-over-container">
        <p class="game-over-message">{{ gameOverMessage }}</p>
      </div>

      <div class="game-content">
        <div class="lives-container" v-if="!gameOver">
          <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>
        </div>

        <div class="sudoku-container">
          <sudoku-grid
            :grid="sudokuGrid"
            @cell-updated="handleCellUpdate"
            :coloredCell="coloredCell"
            :final="final"
          />
        </div>

        <!-- Se il gioco è finito, mostra il messaggio e il pulsante per rigiocare -->
        <div v-if="gameOver" class="game-over-container" style="margin-top: 20px;">
          <button @click="startNewGame" class="button new-game-button">Inizia una Nuova Partita</button>
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
  components: { SudokuGrid },
  data() {
    return {
      gameId: null,
      sudokuGrid: [],
      vite: 3,
      message: "",
      gameOver: false,
      gameOverMessage: "",
      difficulty: "easy",
      coloredCell: null,
      final: false,
      userFilledCells: null,
      initialPuzzle: ""
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
      this.final = false;
      this.userFilledCells = null;

      try {
        const response = await axios.get(`/game/new?difficulty=${this.difficulty}`);
        const data = response.data;
        this.gameId = data.gameId;
        this.vite = data.vite;
        this.initialPuzzle = data.puzzle;
        this.initializeGrid(data.puzzle);
      } catch (error) {
        console.error("Errore nella creazione della partita:", error);
      }
    },
    async handleCellUpdate(cellData) {
      if (!this.gameId) return;
      try {
        // Resetta il colore della cella errata al nuovo inserimento
        this.coloredCell = null;

        const response = await axios.post("/game/insert", {
          gameId: this.gameId,
          row: cellData.row,
          col: cellData.col,
          value: cellData.value,
        });
        const data = response.data;
        this.message = data.message || "";
        this.vite = data.vite;

        if (data.gameOver) {
          this.userFilledCells = this.sudokuGrid.map(row =>
            row.map(cell => !cell.readOnly && cell.value !== '')
          );

          this.gameOver = true;
          this.gameOverMessage = data.message || "Partita terminata.";
          this.final = true;
          if (data.solution) {
            this.initializeGridWithSolution(data.puzzle, data.solution);
          } else {
            this.initializeGrid(data.puzzle);
          }
          if (this.gameOverMessage.startsWith("Hai perso")) {
            // Le celle mancanti verranno colorate di rosso all'interno di initializeGridWithSolution
          }
        } else {
          this.initializeGrid(data.puzzle);
          if (data.message.startsWith("Giusto")) {
            const { row, col } = cellData;
            if (this.sudokuGrid[row] && this.sudokuGrid[row][col]) {
              this.sudokuGrid[row][col].isGreen = true;
              this.sudokuGrid[row][col].readOnly = true;
            }
          } else if (data.message.startsWith("Sbagliato")) {
            this.coloredCell = { row: cellData.row, col: cellData.col, color: "red" };
          }
        }
      } catch (error) {
        console.error("Errore nell'inserimento del numero:", error);
      }
    },
    initializeGrid(puzzle) {
      let newGrid = [];
      for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;
          const char = puzzle[index];
          const previous = this.sudokuGrid[i] && this.sudokuGrid[i][j];
          row.push({
            value: char === "-" ? "" : char,
            readOnly: char !== "-",
            isGreen: previous ? previous.isGreen : false,
            isRed: false
          });
        }
        newGrid.push(row);
      }
      this.sudokuGrid = newGrid;
    },
    initializeGridWithSolution(puzzle, solution) {
      const previousGrid = this.sudokuGrid;
      this.sudokuGrid = [];
      for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;
          const char = puzzle[index];
          const initiallyFilled = this.initialPuzzle[index] !== "-";
          const previouslyGreen = previousGrid[i] && previousGrid[i][j] && previousGrid[i][j].isGreen;
          let cellValue;
          if (char === "-" && solution) {
            cellValue = solution[index];
          } else {
            cellValue = char === "-" ? "" : char;
          }
          row.push({
            value: cellValue,
            readOnly: true,
            isGreen: !initiallyFilled && previouslyGreen,
            isRed: !initiallyFilled && !previouslyGreen
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
.message-container {
  font-size: 1.1em;
  margin-top: 10px;
}
</style>
