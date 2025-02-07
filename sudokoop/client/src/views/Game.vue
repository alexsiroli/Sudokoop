
<script>
import axios from "../main.js";
import SudokuGrid from "../components/SudokuGrid.vue";
import Leaderboard from "../components/Leaderboard.vue";
import BackButton from "../components/BackButton.vue";

export default {
  name: "Game",
  components: { SudokuGrid, Leaderboard, BackButton },
  data() {
    return {
      gameId: null,
      sudokuGrid: [],
      vite: 3,
      gameOver: false,
      gameOverMessage: "",
      difficulty: "easy",
      coloredCell: null,
      firstInitialization: true,
      lastCell: null,
      final: false,
      initialPuzzle: "",
      // Cronometro
      startTime: 0,
      timeSpent: 0,
      timerInterval: null,
      // Leaderboard
      showLeaderboard: false,
    };
  },
  computed: {
    hearts() {
      return "❤️".repeat(this.vite);
    },
    // Formatta il tempo in mm:ss
    formattedTime() {
      const totalSeconds = Math.floor(this.timeSpent / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const mm = String(minutes).padStart(2, "0");
      const ss = String(seconds).padStart(2, "0");
      return `${mm}:${ss}`;
    }
  },
  methods: {
    async startNewGame() {
      this.stopTimer();
      this.gameOver = false;
      this.gameOverMessage = "";
      this.vite = 3;
      this.sudokuGrid = [];
      this.gameId = null;
      this.final = false;
      this.showLeaderboard = false;
      this.startTimer();
      this.firstInitialization = true;

      try {
        const response = await axios.get(`/game/new?difficulty=${this.difficulty}`);
        const data = response.data;
        this.gameId = data.gameId;
        this.vite = data.vite;
        this.initialPuzzle = data.puzzle;
        this.initializeGrid(data.puzzle);
        this.firstInitialization = false;
      } catch (error) {
        console.error("Errore nella creazione della partita:", error);
      }
    },
    changeCelColor(rowIndex, colIndex, color) {
      this.sudokuGrid[rowIndex][colIndex].color = color;
      this.$nextTick(() => {
        if (this.$refs.grid) {
          this.$refs.grid.setCellColor(rowIndex, colIndex, color);
        }
      });
    },
    async handleCellUpdate(cellData) {
      if (!this.gameId) return;

      // Resetta l'eventuale cella rossa precedentemente colorata

      try {
        const response = await axios.post("/game/insert", {
          gameId: this.gameId,
          row: cellData.row,
          col: cellData.col,
          value: cellData.value
        });
        const data = response.data;
        this.vite = data.vite;
        if (data.gameOver) {
          // Ferma il timer
          this.stopTimer();
          this.gameOver = true;
          this.gameOverMessage = data.message;
          // Determina se è vittoria o sconfitta
          let result = "lose";
          if (data.win) {
            result = "win";
            // Se vittoria => salva tempo in leaderboard
            await this.saveTimeToLeaderboard(this.timeSpent);
          }

          // Aggiorna statistiche (win/lose) se hai un endpoint updateStats
          const username = sessionStorage.getItem("username") || "AnonUser";
          await axios.post("/game/updateStats", {username, result});
          this.final = true;

          if (!data.win) {
            this.initializeGridWithSolution(data.solution);
          } else {
            const {row, col} = cellData;
            if (this.sudokuGrid[row] && this.sudokuGrid[row][col]) {
              this.changeCelColor(row, col, "green-selected")
              this.sudokuGrid[row][col].readOnly = true;
            }
          }

        } else {
          const {row, col} = cellData;
          if (data.message.startsWith("Giusto")) {

            if (this.sudokuGrid[row] && this.sudokuGrid[row][col]) {
              if (this.lastCell != null) {
                this.changeCelColor(this.lastCell.row, this.lastCell.col, 'white');
              }
              this.changeCelColor(row, col,   "green-selected")
              this.sudokuGrid[row][col].readOnly = true;
              this.lastCell = null;
            }
          } else if (data.message.startsWith("Sbagliato")) {
            // Colora la cella di rosso temporaneamente
            if (this.lastCell != null) {
              this.changeCelColor(this.lastCell.row, this.lastCell.col, 'white');
            }
            this.lastCell = cellData;
            this.changeCelColor(row, col, 'red')
          }
          this.initializeGrid(data.puzzle);
        }
      } catch (error) {
        console.error("Errore nell'inserimento del numero:", error);
      }
    },

    // Avvio cronometro
    startTimer() {
      this.timeSpent = 0;
      this.startTime = Date.now();
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.timeSpent = Date.now() - this.startTime;
      }, 100);
    },
    // Stop cronometro
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    // Salva il tempo nella leaderboard
    async saveTimeToLeaderboard(timeMs) {
      try {
        const username = sessionStorage.getItem("username") || "AnonUser";
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

          const isReadOnly = char !== "-";
          const previous = this.sudokuGrid[i] && this.sudokuGrid[i][j];
          const previousCol = previous === undefined ? 'white' : this.sudokuGrid[i][j].color;
          row.push({
            value: isReadOnly ? char : "",
            readOnly: this.firstInitialization ? isReadOnly : this.sudokuGrid[i][j].readOnly,
            color: this.firstInitialization && isReadOnly ? 'filled' : previousCol, // Colore iniziale per celle fisse
          });
        }
        newGrid.push(row);
      }
      this.sudokuGrid = newGrid;
    },

    // Griglia soluzione a fine partita
    initializeGridWithSolution(solution) {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;

          if (this.sudokuGrid[i][j].color === 'white' || (this.sudokuGrid[i][j].color !== 'filled'
            && !this.sudokuGrid[i][j].color.endsWith('-selected'))) {
            this.sudokuGrid[i][j].value = solution[index];
            this.changeCelColor(i, j, 'red')
          }
          this.sudokuGrid[i][j].readOnly = true;
        }
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
    // Recupera la difficoltà dalla query
    const diff = this.$route.query.difficulty;
    if (["easy", "medium", "hard"].includes(diff)) {
      this.difficulty = diff;
    }
    this.startNewGame();
  },
  beforeUnmount() {
    this.stopTimer();
  }
};
</script>
<template>
  <div class="centered-container">
    <div class="rounded-box game-container">
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

          />
        </div>

        <button @click="goToHome" class="button-exit"> Abbandona la partita </button>

        <!-- Se il gioco è finito -->
        <div v-if="gameOver" class="game-over-container" style="margin-top: 20px;">
          <!-- Se l'utente ha vinto, mostra anche il tempo impiegato -->
          <p v-if="gameOverMessage.startsWith('Hai vinto')">
            {{ gameOverMessage }}<br/>
            Tempo impiegato: {{ formattedTime }}
          </p>

          <!-- Bottoni con un po' di spazio fra loro -->
          <div class="buttons-row">
            <button @click="startNewGame" class="button new-game-button">
              Inizia una Nuova Partita
            </button>
            <button @click="toggleLeaderboard" class="button new-game-button">
              Mostra Classifica
            </button>
          </div>
        </div>

        <!-- Leaderboard come overlay -->
        <Leaderboard
          v-if="showLeaderboard"
          @close="showLeaderboard = false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-over-message {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #d9534f; /* un rosso “danger” */
}
</style>
