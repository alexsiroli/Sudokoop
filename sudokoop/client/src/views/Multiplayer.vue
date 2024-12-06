<template>
  <div>
    <h1>Gioco Multiplayer</h1>
    <!-- Componente per la griglia di Sudoku -->
    <sudoku-grid :grid="sudokuGrid" @cell-updated="handleCellUpdate" />
    <!-- Componente per la chat -->
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
      sudokuGrid: [], // Dati per la griglia di Sudoku, inizialmente vuota
    };
  },
  methods: {
    // Metodo per gestire l'aggiornamento di una cella
    handleCellUpdate(cellData) {
      // Aggiorna il valore della cella specifica nella griglia
      this.sudokuGrid[cellData.row][cellData.col].value = cellData.value;
      // Invia l'aggiornamento al server tramite socket
      socket.emit('cellUpdate', cellData);
    },
    // Metodo per inizializzare la griglia di Sudoku
    initializeGrid() {
      // In uno scenario reale, dovresti ottenere la griglia dal server
      this.sudokuGrid = [];
      for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
          row.push({
            value: '', // Valore iniziale della cella, vuoto
            readOnly: false, // Indica se la cella è modificabile o meno
          });
        }
        this.sudokuGrid.push(row);
      }
    },
  },
  mounted() {
    // Inizializza la griglia quando il componente è montato
    this.initializeGrid();

    // Ascolta gli aggiornamenti della griglia inviati dal server tramite socket
    socket.on('gridUpdate', (cellData) => {
      this.sudokuGrid[cellData.row][cellData.col].value = cellData.value;
    });
  },
  beforeUnmount() {
    // Rimuove l'ascoltatore di eventi quando il componente viene smontato
    socket.off('gridUpdate');
  },
};
</script>

<style scoped>
/* Stili per la pagina multiplayer */
</style>
