<template>
  <div class="sudoku-grid">
    <!-- Generiamo 81 div, uno per cella -->
    <div
      v-for="(_, index) in cellIndices"
      :key="index"
      :class="getCellClass(index)"
    >
      <input
        type="text"
        maxlength="1"
        v-model="grid[rowIndexOf(index)][colIndexOf(index)].value"
        :disabled="grid[rowIndexOf(index)][colIndexOf(index)].readOnly"
        @input="onCellInput(index, grid[rowIndexOf(index)][colIndexOf(index)].value)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SudokuGrid',
  props: {
    grid: { type: Array, required: true },
    coloredCell: { type: Object, default: null },
    final: { type: Boolean, default: false }
  },
  data() {
    return {
      lastCell: null
    };
  },
  watch: {
    grid() {
      this.lastCell = null;
    }
  },
  computed: {
    // Array di 81 elementi [0..80] per ciclarli in un singolo grid container
    cellIndices() {
      return Array.from({ length: 81 }, (_, i) => i)
    }
  },
  methods: {
    // Calcolo riga e colonna in base all'indice piatto [0..80]
    rowIndexOf(index) {
      return Math.floor(index / 9)
    },
    colIndexOf(index) {
      return index % 9
    },

    onCellInput(index, value) {
      const rowIndex = this.rowIndexOf(index)
      const colIndex = this.colIndexOf(index)

      const isValid = /^[1-9]$/.test(value)
      this.lastCell = {
        row: rowIndex,
        col: colIndex,
        isCorrect: isValid
      };

      // Se non è valido, pulisci la cella
      if (!isValid) {
        this.grid[rowIndex][colIndex].value = ''
        return
      }

      // Altrimenti, emetti l'evento
      const cellData = { row: rowIndex, col: colIndex, value: parseInt(value, 10) }
      this.$emit('cell-updated', cellData)
    },

    getCellClass(index) {
      const rowIndex = this.rowIndexOf(index)
      const colIndex = this.colIndexOf(index)
      const cell = this.grid[rowIndex][colIndex]

      return {
        'cell': true,
        'cell-border-right': (colIndex + 1) % 3 === 0 && colIndex !== 8,
        'cell-border-bottom': (rowIndex + 1) % 3 === 0 && rowIndex !== 8,
        'cell-readonly': cell.readOnly,
        // eventuali highlight per single-player
        'sp-green': cell.isGreen,
        'sp-red': (
          (this.final && cell.isRed) ||
          (!this.final &&
            this.coloredCell &&
            this.coloredCell.row === rowIndex &&
            this.coloredCell.col === colIndex &&
            this.coloredCell.color === 'red'
          )
        ),
        // ultima cella corretta/errata
        'last-correct': this.lastCell &&
          this.lastCell.row === rowIndex &&
          this.lastCell.col === colIndex &&
          this.lastCell.isCorrect,
        'last-incorrect': this.lastCell &&
          this.lastCell.row === rowIndex &&
          this.lastCell.col === colIndex &&
          !this.lastCell.isCorrect
      }
    }
  }
}
</script>

<style scoped>
.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 0;
  width: 450px;
  margin: 20px auto;
  border: 2px solid #333;
  background-color: #fff;
}

.cell {
  border: 1px solid #ccc;
  position: relative;
  /* Mantiene il rapporto 1:1 per ogni cella */
  aspect-ratio: 1 / 1;
}

/* Bordi di separazione blocchi 3x3 */
.cell-border-right {
  border-right: 2px solid #333;
}

.cell-border-bottom {
  border-bottom: 2px solid #333;
}

/* Input nelle celle */
.cell input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1.5em;
  border: none;
  outline: none;
}

/* Celle read-only (già compilate) -> grigio chiaro */
.cell-readonly input {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

/* Celle corrette in verde */
.sp-green input,
.last-correct input {
  background-color: #d4edda;
}

/* Ultima cella sbagliata in rosso */
.last-incorrect input {
  background-color: #f8d7da;
}

/* Celle da colorare in rosso a fine partita */
.sp-red input {
  background-color: #f8d7da;
}
</style>
