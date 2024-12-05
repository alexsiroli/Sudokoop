<template>
  <div>
    <h1>Gioco Multiplayer</h1>
    <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
    <chat-box />
  </div>
</template>

<script>
import SudokuGrid from '../components/SudokuGrid.vue';
import ChatBox from '../components/ChatBox.vue';
import socket from '../plugins/socket.js';

export default {
  name: 'Multiplayer',
  components: {
    SudokuGrid,
    ChatBox,
  },
  data() {
    return {
      sudokuGrid: [],
    };
  },
  methods: {
    handleCellUpdate(cellData) {
      this.sudokuGrid[cellData.row][cellData.col].value = cellData.value;
      socket.emit('cellUpdate', cellData);
    },
    initializeGrid() {
      // In un vero scenario, dovresti ottenere la griglia dal server
      this.sudokuGrid = [];
      for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
          row.push({
            value: '',
            readOnly: false,
          });
        }
        this.sudokuGrid.push(row);
      }
    },
  },
  mounted() {
    this.initializeGrid();

    socket.on('gridUpdate', (cellData) => {
      this.sudokuGrid[cellData.row][cellData.col].value = cellData.value;
    });
  },
  beforeUnmount() {
    socket.off('gridUpdate');
  },
};
</script>

<style scoped>
/* Stili per la pagina multiplayer */
</style>
