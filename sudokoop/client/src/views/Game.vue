<template>
  <div class="centered-container">
    <div class="rounded-box game-container">
      <button @click="goToHome" class="back-button" title="Torna alla Home">&#8592;</button>
      <h1 class="title">Gioco Singolo - Difficoltà: {{ difficulty }}</h1>

      <!-- Se l'utente ha perso, messaggio sopra la griglia -->
      <div v-if="gameOver && gameOverMessage.startsWith('Hai perso')" class="game-over-container">
        <p class="game-over-message">{{ gameOverMessage }}</p>
      </div>

      <div class="game-content">
        <!-- Mostra vite + cronometro se la partita è attiva -->
        <div class="lives-container" v-if="!gameOver">
          <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>
          <p>Tempo trascorso: {{ formattedTime }}</p>
        </div>

        <!-- Griglia Sudoku -->
        <div class="sudoku-container">
          <sudoku-grid
            :grid="sudokuGrid"
            @cell-updated="handleCellUpdate"
            :coloredCell="coloredCell"
            :final="final"
          />
        </div>

        <!-- Se il gioco è finito (vittoria o sconfitta), pulsante rigioca -->
        <div v-if="gameOver" class="game-over-container" style="margin-top: 20px;">
          <!-- Se l'utente ha vinto, mostra anche il tempo impiegato -->
          <p v-if="gameOverMessage.startsWith('Hai vinto')">
            {{ gameOverMessage }}<br />
            Tempo impiegato: {{ formattedTime }} secondi
          </p>
          <button @click="startNewGame" class="button new-game-button">Inizia una Nuova Partita</button>

          <!-- Bottone per mostrare la leaderboard -->
          <button @click="toggleLeaderboard" class="button new-game-button" style="margin-top: 15px;">
            Mostra Classifica
          </button>
        </div>

        <!-- Visualizzazione Leaderboard in overlay o blocco a parte -->
        <Leaderboard
          v-if="showLeaderboard"
          @close="showLeaderboard = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "../main.js";
import SudokuGrid from "../components/SudokuGrid.vue";
import Leaderboard from "../components/Leaderboard.vue";

export default {
  name: "Game",
  components: { SudokuGrid, Leaderboard },
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
      initialPuzzle: "",
      // Cronometro
      startTime: 0,
      timeSpent: 0,
      timerInterval: null,
      // Leaderboard
      showLeaderboard: false
    };
  },
  computed: {
    hearts() {
      return "❤️".repeat(this.vite);
    },
    formattedTime() {
      return (this.timeSpent / 1000).toFixed(1); // tempo in secondi con un decimale
    }
  },
  methods: {
    async startNewGame() {
      // Resetta stati
      this.gameOver = false;
      this.gameOverMessage = "";
      this.message = "";
      this.vite = 3;
      this.sudokuGrid = [];
      this.gameId = null;
      this.final = false;
      this.userFilledCells = null;
      this.showLeaderboard = false;

      // Avvio cronometro
      this.startTimer();

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

      // Resetta cella colorata di errore
      this.coloredCell = null;

      try {
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
          // Ferma il timer
          this.stopTimer();

          // Se vinto => invia punteggio al server
          if (data.message.startsWith("Hai vinto")) {
            await this.saveTimeToLeaderboard(this.timeSpent);
          }

          // userFilledCells ci serve se vogliamo colorare celle
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
        } else {
          this.initializeGrid(data.puzzle);
          if (data.message.startsWith("Giusto")) {
            const { row, col } = cellData;
            if (this.sudokuGrid[row] && this.sudokuGrid[row][col]) {
              this.sudokuGrid[row][col].isGreen = true;
              this.sudokuGrid[row][col].readOnly = true;
            }
          } else if (data.message.startsWith("Sbagliato")) {
            // Colora la cella di rosso temporaneamente
            this.coloredCell = { row: cellData.row, col: cellData.col, color: "red" };
          }
        }
      } catch (error) {
        console.error("Errore nell'inserimento del numero:", error);
      }
    },

    // Cronometro: avvio
    startTimer() {
      this.timeSpent = 0;
      this.startTime = Date.now();
      if (this.timerInterval) clearInterval(this.timerInterval);

      this.timerInterval = setInterval(() => {
        // Aggiorna timeSpent con la differenza
        this.timeSpent = Date.now() - this.startTime;
      }, 100);
    },

    // Cronometro: stop
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    // Salva il tempo nella leaderboard
    async saveTimeToLeaderboard(timeMs) {
      try {
        // TODO: Sostituisci "DemoUser" con un vero username
        const username = "DemoUser";
        await axios.post("/game/time", {
          username,
          milliseconds: timeMs,
          difficulty: this.difficulty
        });
      } catch (err) {
        console.error("Errore nel salvataggio del tempo:", err);
      }
    },

    // Inizializza la griglia
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

    // Griglia soluzione a fine partita
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

    toggleLeaderboard() {
      this.showLeaderboard = !this.showLeaderboard;
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
  beforeUnmount() {
    // In caso l'utente cambi pagina, stoppa il timer
    this.stopTimer();
  }
};
</script>

<style scoped>
.game-over-message {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
