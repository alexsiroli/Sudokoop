<script>

import SudokuGrid from "./SudokuGridMulti.vue";
import socket from "../plugins/socket";
import LobbyUser from "./LobbyUsers.vue";
import Timer from "./Timer.vue";
import TeamContainer from "./TeamContainer.vue";

export default {
  // COLOR vale giallo/blue nel caso versus, senno gray nel caso coop
  props: ['puzzle', 'mode', 'restartNewGame', 'color', 'getGameData','changeVite', 'yellowTeam', 'blueTeam'],
  name: 'Multiplayer',
  components: {SudokuGrid, LobbyUser, Timer, TeamContainer},
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
      yellow: {team: this.yellowTeam, point: 0},
      blue: {team: this.blueTeam, point: 0},
    };
  },

  methods: {

    // chiamato la prima inizializzazione oppure quando ho perso e devo riiniziare
    startNewGame() {
      if (this.gameOver && this.isMaster) {
        this.restartNewGame();
      }
      this.isInitialized = true;
      this.gameOver = false;
      this.firstInitialization = true;
      this.sudokuGrid = [];
      this.initializeGrid(this.puzzle);
      //this.team = this.yellowTeam.some(t => t.username === sessionStorage.getItem('username')) ? 'yellow' : 'blue';
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

    // inserimento di un valore
    handleCellUpdate(cellData) {
      // dico al server che ho inserito
      socket.emit("cellUpdateMulti", {
        cellData: cellData,
        lobbyCode: sessionStorage.getItem("lobbyCode"),
        username: sessionStorage.getItem("username"),
      });

    },

    // colora la cella come selezionata e comunicalo agli altri
    handelCellFocus(rowIndex, colIndex) {
      socket.emit("cellFocus", {
        rowIndex: rowIndex,
        colIndex: colIndex,
        lobbyCode: sessionStorage.getItem("lobbyCode"),
        color: this.color,
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

          if (this.sudokuGrid[i][j].color === 'white' || (this.sudokuGrid[i][j].color !== 'filled'
            && !this.sudokuGrid[i][j].color.endsWith('-selected'))) {
            this.sudokuGrid[i][j].value = solution[index];
            this.changeCelColor(i, j, 'red')
          }
          this.sudokuGrid[i][j].readOnly = true;
        }
      }
    },

    setReadOnlyForEliminated(username) {
      if (sessionStorage.getItem('username') === username) {
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            this.sudokuGrid[i][j].readOnly = true;
          }
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
    this.startNewGame();

    socket.on("backToLobby", () => {
      this.$router.push({name: 'Lobby'});
    });
    socket.emit('getPlayersOfGame', sessionStorage.getItem("lobbyCode"))
    socket.on('playersOfGame', players => {
      this.players = players;
      players.forEach(player => {
        if (player.isMaster) {
          this.masterUser = player.username;
          if (player.username === sessionStorage.getItem("username")) {
            this.isMaster = true;
          }
        }
      })
    });

    socket.on("teams", (data) => {
      this.yellow.team = data.yellowTeam;
      this.blue.team = data.blueTeam;
    });

    socket.on("startGame", () => {
      this.getGameData();
      this.startNewGame();
    });

    // reagisco al focus di un utente
    socket.on("cellFocus", (data) => {
      const {rowIndex, colIndex, color} = data;
      this.changeCelColor(rowIndex, colIndex, color);
    });

    socket.on("cellDeselect", (data) => {
      const {rowIndex, colIndex} = data;
      if (this.sudokuGrid[rowIndex][colIndex].color !== "red" &&
        !this.sudokuGrid[rowIndex][colIndex].color.endsWith("-selected")) {
        this.changeCelColor(rowIndex, colIndex, 'white');
      }


    })
    socket.on("insertedNumber", (puzzle) => {
      this.initializeGrid(puzzle)
    });

    socket.on("afterUpdating", (result) => {
      const {data,  username} = result;
      // aggiorna vite se coop
      if (this.mode === "coop") {
        this.changeVite(data.vite);
      } else {
        this.yellow.team = data.yellowTeam;
        this.yellow.point = data.yellowPoint;
        this.blue.team = data.blueTeam;
        this.blue.point = data.bluePoint;
      }

      let color = this.mode === 'coop' ? 'green' : data.color
      // caso gameOver
      if (data.gameOver) {
        this.$nextTick(() => {
          if (this.$refs.timer) {
            this.$refs.timer.stopTimer();
          }
        });
        // avviso sudokugrid
        this.gameOver = true;
        this.gameOverMessage = data.message;

        // condizione per verificare se la partita è finita con una sconfitta (lostCondition) o vittoria
        // ho perso
        if (!data.win) {
          this.initializeGridWithSolution(data.solution);
        }
        else {
          const {row, col} = data.cellData;
          const index = row * 9 + col;
          // vinto: imposti l'ultimo inserimento a verde e imposta il valore
          this.sudokuGrid[row][col].value = data.solution[index];
          this.sudokuGrid[row][col].readOnly = true;
          this.changeCelColor(row, col, color+"-selected")
        }
        // non ho finito vado avanti
      } else {
        const {row, col} = data.cellData;
        if (data.message.startsWith("Giusto")) {

          if (this.sudokuGrid[row] && this.sudokuGrid[row][col]) {
            if (this.lastCell != null) {
              this.changeCelColor(this.lastCell.row, this.lastCell.col, 'white');
            }
            this.sudokuGrid[row][col].readOnly = true;
            this.changeCelColor(row, col, color+"-selected")
            this.lastCell = null;

          }
        } else if (data.message.startsWith("Sbagliato")) {
          if (this.mode !== 'coop') {
            this.setReadOnlyForEliminated(username);
          }
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
<template>
  <!-- Se il gioco è finito e l'utente ha perso, mostra il messaggio sopra la griglia -->
  <div v-if="gameOver" class="game-over-container">
    <p class="game-over-message"> {{ this.gameOverMessage }}</p>
  </div>
  <Timer ref="timer"></Timer>
  <div class="game-layout">

    <TeamContainer v-if="this.mode==='versus'"  ref="teamContainerYellow" :team-name="'Gialla'" :team="this.yellow" ></TeamContainer>


    <div class="sudoku-container">

    <sudoku-grid ref="grid"
                 :grid="sudokuGrid"
                 @cell-updated="handleCellUpdate"
                 :onFocus="handelCellFocus"
                 :onDeselect="handleCellDeselection"
    />

  </div>

    <TeamContainer v-if="this.mode==='versus'"  ref="teamContainerBlue" :team-name="'Blu'" :team="this.blue" ></TeamContainer>

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

<style>
.game-over-message {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
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
.exit {
  color: white;
  background-color: red;
  justify-content: center;
  padding: 10px;
  border-radius: 10px;
}
.game-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
</style>
