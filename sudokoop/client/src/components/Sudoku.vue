<template>
  <div>
    <h1>Sudoku Game</h1>
    <!-- Sudoku Grid Component (to be implemented) -->
    <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />

  </div>
</template>

<script>
import socket from "../plugins/socket.js";
import SudokuGrid from "./SudokuGrid.vue";

export default {
  components: {
    SudokuGrid,

  },
  data() {
    return {
      sudokuGrid: [[0,0]], // The Sudoku grid data
      messages: [], // List of messages or game updates
      isMultiplayer: false, // Flag to check if in multiplayer mode
    };
  },
  methods: {
    handleCellUpdate(cellData) {
      // Emit the cell update to the server
      socket.emit("cellUpdate", cellData);
    },
  },
  mounted() {
    // Listen for updates from the server
    socket.on("gridUpdate", (gridData) => {
      this.sudokuGrid = gridData;
    });

    socket.on("message", (msg) => {
      this.messages.push({ id: Date.now(), text: msg });
    });
  },
  beforeUnmount() {
    // Clean up socket listeners
    socket.off("gridUpdate");
    socket.off("message");
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
