<template>
  <div>
    <h1>Sudoku Game</h1>
    <!-- Componente Griglia Sudoku -->
    <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
  </div>
</template>

<script>
// Importa l'istanza del socket dalla cartella plugins
import socket from "../plugins/socket.js";
import SudokuGrid from "./SudokuGrid.vue";

export default {
  components: {
    SudokuGrid,
  },
  data() {
    return {
      sudokuGrid: [[0,0]], // Dati della griglia del Sudoku
      messages: [], // Lista dei messaggi o aggiornamenti di gioco
      isMultiplayer: false, // Flag per verificare se si è in modalità multiplayer
    };
  },
  methods: {
    handleCellUpdate(cellData) {
      // Emette l'aggiornamento della cella al server
      socket.emit("cellUpdate", cellData);
    },
  },
  mounted() {
    // Ascolta gli aggiornamenti dalla parte server
    socket.on("gridUpdate", (gridData) => {
      this.sudokuGrid = gridData;
    });

    // Ascolta i messaggi dal server
    socket.on("message", (msg) => {
      this.messages.push({ id: Date.now(), text: msg });
    });
  },
  beforeUnmount() {
    // Rimuove i listener del socket quando il componente viene smontato
    socket.off("gridUpdate");
    socket.off("message");
  },
};
</script>

<style scoped>
/* Aggiungi i tuoi stili qui */
</style>
