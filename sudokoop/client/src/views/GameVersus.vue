<script>
import axios from "../main.js";
import SudokuGrid from "../components/SudokuGridMulti.vue";
import socket from "../plugins/socket";
import LobbyUser from "../components/LobbyUsers.vue";
import Timer from "../components/Timer.vue";
import TeamContainer from "../components/TeamContainer.vue";

export default {
  props: ['puzzle', 'difficulty', 'restartNewGame', 'yellowTeam', 'blueTeam'],
  name: 'GameVersus',
  components: {SudokuGrid, LobbyUser, Timer, TeamContainer},
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
      firstInitialization: true,
      isMaster: false,
      lastCell: null,
      team: "",
    };
  },
  computed: {
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
      this.firstInitialization = true;
      this.sudokuGrid = [];
      this.initializeGrid(this.puzzle);
      this.team = this.yellowTeam.includes(sessionStorage.getItem('username')) ? 'yellow' : 'blue';
      this.$nextTick(() => {
        if (this.$refs.timer) {
          this.$refs.timer.startTimer();
        }
      });
      this.firstInitialization = false;
    },
    colorTeam() {

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
      // Resetta il colore della cella errata al nuovo inserimento
      this.coloredCell = null;
      console.log("handleCellUpdate", cellData);
      // dico al server che ho inserito
      socket.emit("cellUpdateMulti", {
        cellData: cellData,
        lobbyCode: sessionStorage.getItem("lobbyCode"),
        color: this.team,
        username: sessionStorage.getItem("username"),
      });

    },

    // colora la cella come selezionata e comunicalo agli altri
    handelCellFocus(rowIndex, colIndex) {
      socket.emit("cellFocus", {
        rowIndex: rowIndex,
        colIndex: colIndex,
        lobbyCode: sessionStorage.getItem("lobbyCode"),
        color: this.team,
      });
    },
    handleCellDeselection(rowIndex, colIndex) {
      socket.emit("cellDeselect", {
        rowIndex: rowIndex,
        colIndex: colIndex,
        lobbyCode: sessionStorage.getItem("lobbyCode"),
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
    goToHome() {
      this.$router.push("/home");
    },
    backToLobby() {
      socket.emit("backToLobby", sessionStorage.getItem("lobbyCode"));
    }
  },

  mounted() {
    console.log("yelloWTeam " + this.yellowTeam)
    console.log("bluTeam " + this.blueTeam)
    this.startNewGame();

    socket.emit("isUserTheMaster",
      {
        username: sessionStorage.getItem('username'),
        code: sessionStorage.getItem("lobbyCode")
      });

    socket.on("backToLobby", () => {
      this.$router.push({name: 'Lobby'});
    })
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
      const {rowIndex, colIndex, color} = data;
      console.log("Color " + color);
      this.changeCelColor(rowIndex, colIndex, color);
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
    socket.on("afterUpdating", (result) => {
      const {data, color} = result;
      console.log("data " + data)
      // aggiorna vite
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

        /*if (this.vite === 0) {
          console.log("inizializza con solizone ")
          this.initializeGridWithSolution(data.solution);
        } else {
          // vinto: imposti l'ultimo inserimento a verde
          this.changeCelColor(data.cellData.row, data.cellData.col, 'green')
        }

         */
      } else {
        const {row, col} = data.cellData;
        if (data.message.startsWith("Giusto")) {

          if (this.sudokuGrid[row] && this.sudokuGrid[row][col]) {
            if (this.lastCell != null) {
              console.log("lastCell is null")
              this.changeCelColor(this.lastCell.row, this.lastCell.col, 'white');
            }
            this.sudokuGrid[row][col].readOnly = true;
            this.changeCelColor(row, col, color+"-selected")
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

.sudoku-container {
  flex-grow: 1; /* Consenti alla griglia Sudoku di occupare lo spazio centrale */
  margin: 0 20px; /* Margine laterale per distanziare dalle squadre */
  text-align: center;
}

.buttons-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 10px;
}

.game-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
          <Timer ref="timer"></Timer>
        </div>
        <div class="game-layout">
        <TeamContainer :team-name="'Gialla'" :players="this.yellowTeam"></TeamContainer>

        <div class="sudoku-container">
          <sudoku-grid ref="grid"
                       :grid="sudokuGrid"
                       @cell-updated="handleCellUpdate"
                       :onFocus="handelCellFocus"
                       :onDeselect="handleCellDeselection"
                       :coloredCell="coloredCell"
          />

        </div>

        <TeamContainer :team-name="'Blu'" :players="this.blueTeam"></TeamContainer>

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
