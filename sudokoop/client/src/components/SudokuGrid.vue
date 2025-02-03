<script>
export default {
  name: 'SudokuGrid',
  props: {
    grid: {type: Array, required: true},
    coloredCell: {type: Object, default: null},
    final: {type: Boolean, default: false}
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
              cell.isGreen ? 'sp-green' :
                (final && cell.isRed ? 'sp-red' :
                  (!final && coloredCell && coloredCell.row === rowIndex && coloredCell.col === colIndex && coloredCell.color === 'red' ? 'sp-red' : '')
                )
            ]"
        >
          <input
            type="text"
            maxlength="1"
            v-model="cell.value"
            :disabled="cell.readOnly"
            @input="onCellInput(rowIndex, colIndex, cell.value)"
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
  border-radius: 0;
  background-color: white;
  transition: background-color var(--transition-speed);
}

.cell-border-right {
  border-right: 2px solid var(--border-color);
}
.cell-border-bottom {
  border-bottom: 2px solid var(--border-color);
}

.cell-readonly input {
  background-color: #f2f2f2;
  font-weight: bold;
}

/* Stili specifici per Single Player */
.sp-green input {
  background-color: #c5f4d0;
}
.sp-red input {
  background-color: #f7c2c2;
}
</style>
