<template>
  <div class="sudoku-grid">
    <table>
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
            @input="onCellInput(rowIndex, colIndex, cell.value)"
          />
        </td>
      </tr>
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
  methods: {
    onCellInput(rowIndex, colIndex, value) {
      // Validate input (ensure it's a number between 1 and 9)
      if (!/^[1-9]$/.test(value)) {
        this.grid[rowIndex][colIndex].value = '';
        return;
      }

      const cellData = {
        row: rowIndex,
        col: colIndex,
        value: parseInt(value),
      };
      // Emit the cell update event to the parent component
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
  },
};
</script>

<style scoped>
.sudoku-grid {
  margin: 0 auto;
}

table {
  border-collapse: collapse;
}

td {
  border: 1px solid #ccc;
  width: 40px;
  height: 40px;
  text-align: center;
  position: relative;
}

input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1.2em;
  border: none;
}

.cell-border-right {
  border-right: 2px solid #000;
}

.cell-border-bottom {
  border-bottom: 2px solid #000;
}

.cell-readonly input {
  background-color: #eaeaea;
}

input:disabled {
  background-color: #eaeaea;
}
</style>
