<script>
import axios from "../main.js";
import SudokuGrid from "../components/SudokuGridMulti.vue";
import socket from "../plugins/socket";
import LobbyUser from "../components/LobbyUsers.vue";
import Timer from "../components/Timer.vue";

export default {
  props: ['puzzle', 'changeVite', 'restartNewGame'],
  name: 'GameMulti',
  components: {SudokuGrid, LobbyUser, Timer},
  data() {
    return {
      message: "",
      gameOver: false,
      gameOverMessage: "",
      sudokuGrid: [],
      firstInitialization: true,
      isMaster: false,
      lastCell: null,
      players: [],
    };
  },

  methods: {

    startNewGame() {
      //console.log("puzzle : " + this.puzzle);
      if (this.gameOver) {
        //faccio richiesta per nuovo gioco e torno indietro (sono il master)
        socket.emit('createCoopGame',
          {
            lobbyCode: sessionStorage.getItem('lobbyCode'),
            difficulty: this.difficulty
          });
        socket.emit("startCoopGame", sessionStorage.getItem('lobbyCode'));
        this.restartNewGame();
      }
      this.gameOver = false;
      this.firstInitialization = true;
      this.sudokuGrid = [];
      this.initializeGrid(this.puzzle);
      this.$nextTick(() => {
        if (this.$refs.timer) {
          this.$refs.timer.startTimer();
        }
      });
      this.firstInitialization = false;
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
          const previousCol = previous === undefined ? 'white' : this.sudokuGrid[i][j].color;
          //console.log("previous", previous);
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

    initializeGridWithSolution(solution) {
      //const previousGrid = this.sudokuGrid;
      //this.sudokuGrid = [];

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const index = i * 9 + j;

          if (this.sudokuGrid[i][j].color === 'white' || (this.sudokuGrid[i][j].color !== 'green'
            && !this.sudokuGrid[i][j].readOnly)) {
            this.sudokuGrid[i][j].value = solution[index];
            this.changeCelColor(i, j, 'red')
          }
          this.sudokuGrid[i][j].readOnly = true;
        }
      }
    },
    leaveGame() {
      // esci dalla lobby: comunichi al server
      socket.emit("leaveGame",
        {
          code: sessionStorage.getItem("lobbyCode"),
          username: sessionStorage.getItem("username"),
        });
      this.$router.push({name: 'Lobby'});
    },
    backToLobby() {
      socket.emit("backToLobby", sessionStorage.getItem("lobbyCode"));
    }
  },

  mounted() {
    // configurazione griglia
    this.startNewGame();
    // recupero giocatori
    socket.emit('getPlayersOfGame', sessionStorage.getItem("lobbyCode"))
    socket.on('playersOfGame', players => {
      this.players = players;
      players.forEach(player => {
        if (player.isMaster && player.username === sessionStorage.getItem("username")) {
          this.isMaster = true;
        }
      })
    })

    socket.on("backToLobby", () => {
      this.$router.push({name: 'Lobby'});
    })
    socket.on("startCoopGame", () => {
      this.restartNewGame();
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
    });

    socket.on("afterUpdating", (result) => {
      const {data, color} = result;
      // aggiorna vite
      this.changeVite(data.vite);
      if (data.gameOver) {
        this.$nextTick(() => {
          if (this.$refs.timer) {
            this.$refs.timer.stopTimer();
          }
        });
        // avviso sudokugrid
        this.gameOver = true;
        this.gameOverMessage = data.message;
        // perso
        if (data.vite === 0) {
          console.log("inizializza con solizone ")
          this.initializeGridWithSolution(data.solution);
        } else {
          const {row, col} = data.cellData;
          const index = row * 9 + col;
          // vinto: imposti l'ultimo inserimento a verde e imposta il valore
          this.sudokuGrid[row][col].value = data.solution[index];
          this.sudokuGrid[row][col].readOnly = true;
          this.changeCelColor(row, col, 'green')
        }
      } else {
        const {row, col} = data.cellData;
        if (data.message.startsWith("Giusto")) {

          if (this.sudokuGrid[row] && this.sudokuGrid[row][col]) {
            if (this.lastCell != null) {
              console.log("lastCell is null")
              this.changeCelColor(this.lastCell.row, this.lastCell.col, 'white');
            }
            this.sudokuGrid[row][col].readOnly = true;
            this.changeCelColor(row, col, 'green')
            this.lastCell = null;

          }
        } else if (data.message.startsWith("Sbagliato")) {
          console.log("Last CEll " + data.cellData)
          if (this.lastCell != null) {
            this.changeCelColor(this.lastCell.row, this.lastCell.col, 'white');
          }
          this.lastCell = data.cellData;
          this.changeCelColor(row, col, 'red')

        }
        this.initializeGrid(data.puzzle)
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

.exit {
  color: white;
  background-color: red;
  justify-content: center;
  padding: 10px;
  border-radius: 10px;
}

.buttons-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 10px;
}
</style>
<template>
  <!-- Se il gioco è finito e l'utente ha perso, mostra il messaggio sopra la griglia -->
  <div v-if="gameOver" class="game-over-container">
    <p class="game-over-message"> {{ this.gameOverMessage }}</p>
  </div>
  <Timer ref="timer"></Timer>
  <div class="sudoku-container">
    <sudoku-grid ref="grid"
                 :grid="sudokuGrid"
                 @cell-updated="handleCellUpdate"
                 :onFocus="handelCellFocus"
                 :onDeselect="handleCellDeselection"
    />

  </div>

  <LobbyUser :players="this.players"></LobbyUser>
  <button v-if="!this.gameOver" @click="leaveGame" class="exit">
    Abbandona la partita
  </button>
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
</template>
