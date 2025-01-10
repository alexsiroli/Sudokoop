
<script>
import axios from "../main.js";
import SudokuGrid from "../components/SudokuGrid.vue";

export default {
  props: ['vite', 'puzzle'],

  components: { SudokuGrid },
  data() {
    return {
      gameId: null,
      message: "",
      gameOver: false,
      gameOverMessage: "",
      difficulty: "easy",
      coloredCell: null,
      final: false,
      userFilledCells: null,
      initialPuzzle: "",
      sudokuGrid: []
    };
  },
  computed: {
    hearts() {
      return "❤️".repeat(this.vite);
    },
  },
  methods: {
    initializeGrid(puzzle) {
      console.log("puzzle sopra " ,this.puzzle);
      console.log("puzzle passato " , puzzle);
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

      console.log("sudokuGrid " , this.sudokuGrid);
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
    console.log("puzzle : " + this.puzzle);
    this.initializeGrid(this.puzzle);
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
<template>
  <div class="centered-container">
    <div class="rounded-box game-container">
      <button @click="goToHome" class="back-button" title="Torna alla Home">&#8592;</button>
      <h1 class="title">Gioco Singolo - Difficoltà: </h1>

      <!-- Se il gioco è finito e l'utente ha perso, mostra il messaggio sopra la griglia -->
      <div v-if="gameOver && gameOverMessage.startsWith('Hai perso')" class="game-over-container">
        <p class="game-over-message">{{ gameOverMessage }}</p>
      </div>

      <div class="game-content">
        <div class="lives-container" v-if="!gameOver">
          <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>
        </div>

        <div class="sudoku-container">
          <sudoku-grid :grid="sudokuGrid" />

        </div>

        <!-- Se il gioco è finito, mostra il messaggio e il pulsante per rigiocare -->
        <div v-if="gameOver" class="game-over-container" style="margin-top: 20px;">
          <button class="button new-game-button">Inizia una Nuova Partita</button>
        </div>
      </div>
    </div>
  </div>
</template>
