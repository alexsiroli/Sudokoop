<script>
import axios from "../main.js";
import SudokuGrid from "../components/SudokuGridMulti.vue";
import socket from "../plugins/socket";
import LobbyUser from "../components/LobbyUsers.vue";
import Timer from "../components/Timer.vue";

export default {
  props: ['initialVite', 'puzzle', 'difficulty', 'restartNewGame'],

  components: {SudokuGrid, LobbyUser, Timer},
  data() {
    return {
      gameId: null,
      message: "",
      gameOver: false,
      gameOverMessage: "",
      coloredCell: null,
      final: false,
      userFilledCells: null,
      sudokuGrid: [],
      vite: 0,
      firstInitialization: true,
      isMaster: false,
    };
  },
  computed: {
    hearts() {
      return "❤️".repeat(this.vite);
    },

  },
  methods: {
    startNewGame() {
      //console.log("puzzle : " + this.puzzle);
      if (this.gameOver) {
        //faccio richiesta per nuovo gioco e torno indietro (sono il master)
        socket.emit('createNewGame',
          {
            lobbyCode: sessionStorage.getItem('lobbyCode'),
            difficulty: this.difficulty
          });
        this.restartNewGame();
      }
      this.isInitialized = true;
      this.gameOver = false;
      this.vite = this.initialVite;
      this.firstInitialization = true;
      this.sudokuGrid = [];
      this.initializeGrid(this.puzzle);

      this.$nextTick(() => {
        if (this.$refs.timer) {
          this.$refs.timer.startTimer();
        }
      });
    },
    initializeGrid(puzzle) {
      let newGrid = [];
      for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;
          const char = puzzle[index];
          const isReadOnly = char !== "-";
          const previous = this.sudokuGrid[i] && this.sudokuGrid[i][j];
          console.log("firstIn " + this.firstInitialization)

          const previousCol = previous === undefined ? 'white' : this.sudokuGrid[i][j].color;
          //console.log("previous", previous);
          console.log("previousCol", previousCol);
          row.push({
            value: isReadOnly ? char : "",
            readOnly: isReadOnly,
            color: this.firstInitialization && isReadOnly ? 'filled' : previousCol, // Colore iniziale per celle fisse
          });
        }
        newGrid.push(row);
      }
      this.sudokuGrid = newGrid;
    },

    // inserimento di un valore
    handleCellUpdate(cellData) {
      // Resetta il colore della cella errata al nuovo inserimento
      this.coloredCell = null;
      console.log("handleCellUpdate", cellData);
      // dico al server che ho inserito
      socket.emit("cellUpdateMulti", {
        cellData: cellData,
        lobbyCode: sessionStorage.getItem("lobbyCode")
      });

    },

    // colora la cella come selezionata e comunicalo agli altri
    handelCellFocus(rowIndex, colIndex) {
      socket.emit("cellFocus", {
        rowIndex: rowIndex,
        colIndex: colIndex,
        lobbyCode: sessionStorage.getItem("lobbyCode")
      });
    },
    handleCellDeselection(rowIndex, colIndex) {
      socket.emit("cellDeselect", {
        rowIndex: rowIndex,
        colIndex: colIndex,
        lobbyCode: sessionStorage.getItem("lobbyCode")
      });

    },
    changeCelColor(rowIndex, colIndex, color) {
      this.sudokuGrid[rowIndex][colIndex].color = color;
      this.$nextTick(() => {
        if (this.$refs.grid) {
          this.$refs.grid.setCellColor(rowIndex, colIndex, color);
        }
      });
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

    this.startNewGame();

    socket.emit("isUserTheMaster",
      {
        username: sessionStorage.getItem('username'),
        code: sessionStorage.getItem("lobbyCode")
      });

    socket.on("restartTheGame", () => {

      this.restartNewGame();
    })
    socket.on("youAreTheMaster", () => {
      this.isMaster = true;
      console.log("i am the master")
    })
    // reagisco al focus di un utente
    socket.on("cellFocus", (data) => {
      console.log("cellFocus!!!");
      const {rowIndex, colIndex} = data;
      this.changeCelColor(rowIndex, colIndex, 'gray');

    });

    socket.on("cellDeselect", (data) => {
      const {rowIndex, colIndex} = data;
      if (this.sudokuGrid[rowIndex][colIndex].color !== "red" && !this.sudokuGrid[rowIndex][colIndex].readOnly) {
        this.changeCelColor(rowIndex, colIndex, 'white');
      }


    })
    socket.on("insertedNumber", (puzzle) => {
      this.initializeGrid(puzzle)
    })
    socket.on("afterUpdating", (data) => {
      console.log("afterUpdating ", data);
      // aggiorna vite
      this.vite = data.vite;
      if (data.gameOver) {
        this.$nextTick(() => {
          if (this.$refs.timer) {
            this.$refs.timer.stopTimer();
          }
        });
        // avviso sudokugrid
        this.final = true;
        this.gameOver = true;
        this.gameOverMessage = data.message;
      } else {
        this.initializeGrid(data.puzzle)
        const {row, col} = data.cellData;
        if (data.message.startsWith("Giusto")) {

          if (this.sudokuGrid[row] && this.sudokuGrid[row][col]) {
            this.sudokuGrid[row][col].readOnly = true;
            this.changeCelColor(row, col, 'green')

          }
        } else if (data.message.startsWith("Sbagliato")) {
          this.changeCelColor(row, col, 'red')

        }
      }
    });
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

.buttons-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 10px;
}
</style>
<template>
  <div class="centered-container">
    <div class="rounded-box game-container">
      <button @click="goToHome" class="back-button" title="Torna alla Home">&#8592;</button>
      <h1 class="title">Gioco Multiplayer</h1>
      <h3>Difficoltà: {{ this.difficulty }}</h3>

      <!-- Se il gioco è finito e l'utente ha perso, mostra il messaggio sopra la griglia -->
      <div v-if="gameOver" class="game-over-container">
        <p class="game-over-message"> {{ this.gameOverMessage }}</p>
      </div>

      <div class="game-content">
        <div class="lives-container" v-if="!gameOver">
          <p>Vite rimanenti: <span class="hearts">{{ hearts }}</span></p>
          <Timer ref="timer"></Timer>
        </div>

        <div class="sudoku-container">
          <sudoku-grid  ref="grid"
                       :grid="sudokuGrid"
                       @cell-updated="handleCellUpdate"
                       :onFocus="handelCellFocus"
                       :onDeselect="handleCellDeselection"
                       :coloredCell="coloredCell"
          />

        </div>

        <LobbyUser></LobbyUser>
        <!-- Se il gioco è finito, mostra il messaggio e il pulsante per rigiocare -->
        <div v-if="gameOver && isMaster" class="game-over-container" style="margin-top: 20px;">
          <div class="buttons-row">
            <button @click="startNewGame" class="button new-game-button">
              Inizia una Nuova Partita
            </button>
            <button @click="backToLobby" class="button new-game-button">
              Torna alla lobby
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
