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
      const cellData = {row: rowIndex, col: colIndex, value: parseInt(value, 10)}
      this.$emit('cell-updated', cellData)
    },

    // Stessi controlli di prima, adattati
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
          (!this.final && this.coloredCell &&
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

<style scoped>
.sudoku-grid {
  /* Griglia di 9 colonne,
     l'altezza delle righe segue il flusso (ogni 9 celle si va a capo) */
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  /* Nessun gap per imitare la tabella compatta, o metti un gap:2px se preferisci */
  gap: 0;

  max-width: 500px;
  margin: 0 auto;
  padding: 20px;

  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 6px var(--shadow-color);
  background-color: var(--box-bg-color);
}

/* Ogni cella della griglia */
.cell {
  /* Bordo singolo leggero */
  border: 1px solid #ccc;
  position: relative;
  box-sizing: border-box;

  /* Così rimane quadrata */
  aspect-ratio: 1 / 1;
}

/* Per le linee più spesse ogni 3x3 blocchi */
.cell-border-right {
  border-right: 2px solid var(--border-color);
}

.cell-border-bottom {
  border-bottom: 2px solid var(--border-color);
}

/* Cellette in sola lettura */
.cell-readonly input {
  background-color: #f2f2f2;
  font-weight: bold;
}

/* Input a grandezza piena */
.cell input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1.4em;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  background-color: white;
  transition: background-color var(--transition-speed);
}

/* Stili single player "giusto" / "sbagliato" */
.sp-green input {
  background-color: #c5f4d0;
}

.sp-red input {
  background-color: #f7c2c2;
}

/* Ultimo inserimento corretto/errato */
.last-correct input {
  box-shadow: inset 0 0 3px 2px #7fff7f;
}

.last-incorrect input {
  box-shadow: inset 0 0 3px 2px #ff7f7f;
}

/* Responsive per schermi stretti */
@media (max-width: 600px) {
  .sudoku-grid {
    padding: 10px;
  }

  .cell input {
    font-size: 1.2em;
  }
}
</style>
