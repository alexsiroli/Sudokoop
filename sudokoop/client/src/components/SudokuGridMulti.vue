<script>
export default {
  name: 'SudokuGrid',
  props: {
    grid: {type: Array, required: true},
    coloredCell: {type: Object, default: null},
    final: {type: Boolean, default: false},
    onFocus: {type: Function, required: false},
    onDeselect: {type: Function, required: false},

  },
  data() {
    return {
      lastCell: null,
    };
  },
  methods: {

    onCellInput(rowIndex, colIndex, value) {
      const isValid = /^[1-9]$/.test(value);
      this.lastCell = {
        row: rowIndex,
        col: colIndex,
        isCorrect: isValid,
      };
      if (!isValid) {
        this.grid[rowIndex][colIndex].value = '';
        return;
      }
      const cellData = {row: rowIndex, col: colIndex, value: parseInt(value, 10)};
      this.$emit('cell-updated', cellData);
    },

    onCellSelect(rowIndex, colIndex) {
      this.onFocus(rowIndex, colIndex);
    },
    onCellDeselect(rowIndex, colIndex) {
      this.onDeselect(rowIndex, colIndex);
    },

    // Metodo per aggiornare il colore di una cella
    setCellColor(rowIndex, colIndex, color) {
      const cell = this.grid[rowIndex][colIndex];
      if (!cell) return;
      // Imposta il colore direttamente
      cell.color = color;
    },

    getCellClass(rowIndex, colIndex) {
      return {
        'cell': true,
        'cell-border-right': (colIndex + 1) % 3 === 0 && colIndex !== 8,
        'cell-border-bottom': (rowIndex + 1) % 3 === 0 && rowIndex !== 8,
        'cell-readonly': this.grid[rowIndex][colIndex].readOnly,
      };
    },
    getLastCellClass(rowIndex, colIndex) {
      if (this.lastCell && this.lastCell.row === rowIndex && this.lastCell.col === colIndex) {
        return this.lastCell.isCorrect ? 'last-correct' : 'last-incorrect';
      }
      return '';
    },
  }
};
</script>
<template>
  <div class="sudoku-grid">
    <table>
      <tbody>
      <tr v-for="(row, rowIndex) in this.grid" :key="rowIndex">
        <td
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :class="[
              getCellClass(rowIndex, colIndex),
              `cell-${cell.color}`]"
        >
          <input
            type="text"
            maxlength="1"
            v-model="cell.value"
            :disabled="cell.readOnly"
            @focus="onCellSelect(rowIndex, colIndex)"
            @input="onCellInput(rowIndex, colIndex, cell.value)"
            @blur="onCellDeselect(rowIndex, colIndex)"
          />
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.sudoku-grid {
  margin: 0 auto;
  max-width: 500px;
  padding: 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 6px var(--shadow-color);
  background-color: var(--box-bg-color);
}

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
  vertical-align: middle;
  box-sizing: border-box;
}
input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1.4em;
  border: 1px solid #ccc;
  outline: none;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  transition: background-color var(--transition-speed);
}

/* Bordi più spessi per le sezioni sudoku */
.cell-border-right {
  border-right: 2px solid var(--border-color);
}
.cell-border-bottom {
  border-bottom: 2px solid var(--border-color);
}

/* Vari colori per le selezioni di celle in multi */
.cell-green-selected input {
  background-color: #c5f4d0;
  font-weight: bold;
}
.cell-red input {
  background-color: #f7c2c2;
  font-weight: bold;
}
.cell-yellow input {
  background-color: #fff9cc;
}
.cell-blue input {
  background-color: #cce6ff;
}
.cell-yellow-selected input {
  background-color: #fef5b1;
  font-weight: bold;
}
.cell-blue-selected input {
  background-color: #aedaff;
  font-weight: bold;
}
.cell-gray input {
  background-color: #b0bec5;
}
.cell-white input {
  background-color: white;
}
.cell-filled input {
  background-color: #f2f2f2;
  font-weight: bold;
}
</style>
