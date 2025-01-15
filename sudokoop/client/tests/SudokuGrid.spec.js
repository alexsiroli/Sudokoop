import { mount } from '@vue/test-utils';
import SudokuGrid from '@/components/SudokuGrid.vue';

describe('SudokuGrid.vue', () => {
  let wrapper;
  const createGrid = () => {
    const grid = [];
    for (let i = 0; i < 9; i++) {
      const row = [];
      for (let j = 0; j < 9; j++) {
        row.push({
          value: '-',
          readOnly: false,
          isGreen: false,
          isRed: false,
        });
      }
      grid.push(row);
    }
    return grid;
  };

  beforeEach(() => {
    wrapper = mount(SudokuGrid, {
      props: { grid: createGrid(), coloredCell: null, final: false },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('emette "cell-updated" con dati validi', async () => {
    const rowIndex = 0;
    const colIndex = 0;
    const testValue = '5';

    await wrapper.vm.onCellInput(rowIndex, colIndex, testValue);

    expect(wrapper.emitted('cell-updated')).toBeTruthy();
    const emitted = wrapper.emitted('cell-updated')[0][0];
    expect(emitted).toEqual({ row: rowIndex, col: colIndex, value: 5 });

    expect(wrapper.vm.lastCell).toEqual({
      row: rowIndex,
      col: colIndex,
      isCorrect: true
    });
  });

  it('non emette "cell-updated" per input non valido e resetta valore', () => {
    const rowIndex = 0;
    const colIndex = 1;
    wrapper.vm.grid[rowIndex][colIndex].value = 'a'; // valore iniziale

    wrapper.vm.onCellInput(rowIndex, colIndex, 'a');

    expect(wrapper.emitted('cell-updated')).toBeFalsy();
    expect(wrapper.vm.grid[rowIndex][colIndex].value).toBe('');
    expect(wrapper.vm.lastCell).toEqual({
      row: rowIndex,
      col: colIndex,
      isCorrect: false
    });
  });

  it('calcola la classe della cella correttamente con bordi', () => {
    const classes = wrapper.vm.getCellClass(2, 2);
    expect(classes).toMatchObject({
      cell: true,
      'cell-border-right': true,
      'cell-border-bottom': true,
      'cell-readonly': false,
    });
  });

  it('calcola la classe della cella correttamente senza bordi', () => {
    const classes = wrapper.vm.getCellClass(0, 0);
    expect(classes).toMatchObject({
      cell: true,
      'cell-border-right': false,
      'cell-border-bottom': false,
      'cell-readonly': false,
    });
  });

  it('ritorna last-correct o last-incorrect basato su lastCell', () => {
    wrapper.vm.lastCell = { row: 1, col: 1, isCorrect: true };
    const classNameCorrect = wrapper.vm.getLastCellClass(1, 1);
    expect(classNameCorrect).toBe('last-correct');

    wrapper.vm.lastCell.isCorrect = false;
    const classNameIncorrect = wrapper.vm.getLastCellClass(1, 1);
    expect(classNameIncorrect).toBe('last-incorrect');

    const classNameDifferent = wrapper.vm.getLastCellClass(0, 0);
    expect(classNameDifferent).toBe('');
  });
});
