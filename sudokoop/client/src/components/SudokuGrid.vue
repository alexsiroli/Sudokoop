<template>
  <div class="sudoku-grid">
    <table>
      <tbody>
      <tr v-for="(row, rowIndex) in grid" :key="rowIndex">
        <td
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :class="getCellClass(rowIndex, colIndex)"
        >
          <input
            type="text"
            maxlength="1"
            v-model="cell.value"
            :disabled="cell.readOnly"
            :class="getLastCellClass(rowIndex, colIndex)"
            @input="onCellInput(rowIndex, colIndex, cell.value)"
          />
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'SudokuGrid',
  props: {
    grid: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      lastCell: null, // Tiene traccia dell'ultima cella inserita, insieme al suo stato di correttezza
    };
  },
  methods: {
    onCellInput(rowIndex, colIndex, value) {
      // Valida l'input (solo numeri da 1 a 9)
      const isValid = /^[1-9]$/.test(value);

      // Aggiorna l'ultima cella inserita con il suo stato di correttezza
      this.lastCell = {
        row: rowIndex,
        col: colIndex,
        isCorrect: isValid,
      };

      if (!isValid) {
        this.grid[rowIndex][colIndex].value = '';
        return;
      }

      const cellData = {
        row: rowIndex, // Indice della riga della cella
        col: colIndex, // Indice della colonna della cella
        value: parseInt(value, 10), // Valore della cella inserito dall'utente
      };

      // Emetti l'evento al componente padre
      this.$emit('cell-updated', cellData);
    },
    getCellClass(rowIndex, colIndex) {
      return {
        'cell': true,
        'cell-border-right': (colIndex + 1) % 3 === 0 && colIndex !== 8, // Aggiunge un bordo più spesso a destra ogni 3 celle
        'cell-border-bottom': (rowIndex + 1) % 3 === 0 && rowIndex !== 8, // Aggiunge un bordo più spesso in basso ogni 3 righe
        'cell-readonly': this.grid[rowIndex][colIndex].readOnly, // Classe per celle di sola lettura
      };
    },
    getLastCellClass(rowIndex, colIndex) {
      if (this.lastCell && this.lastCell.row === rowIndex && this.lastCell.col === colIndex) {
        return this.lastCell.isCorrect ? 'last-correct' : 'last-incorrect';
      }
      return '';
    },
  },
};
</script>

<style scoped>
/* Stili principali della griglia */
.sudoku-grid {
  margin: 0 auto;
  max-width: 500px;
  padding: 20px;
  border: 3px solid #000;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  background-color: #f9f9f9;
}

/* Stili della tabella */
table {
  border-collapse: collapse;
  width: 100%;
}

td {
  border: 1px solid #ccc;
  width: 50px;
  height: 50px;
  text-align: center;
  position: relative;
}

/* Stili per l'input delle celle */
input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1.4em;
  border: none;
  outline: none;
}

/* Stili per i bordi speciali */
.cell-border-right {
  border-right: 2px solid #000;
}

.cell-border-bottom {
  border-bottom: 2px solid #000;
}

/* Stili per celle di sola lettura */
.cell-readonly input {
  background-color: #eaeaea;
  font-weight: bold;
}

input:disabled {
  background-color: #eaeaea;
}

/* Stili per l'ultima cella corretta */
input.last-correct {
  background-color: #d4edda;
}

/* Stili per l'ultima cella sbagliata */
input.last-incorrect {
  background-color: #f8d7da;
}
</style>
