import { mount } from '@vue/test-utils'
import SudokuGrid from '@/components/SudokuGrid.vue'

describe('SudokuGrid.vue', () => {
  let wrapper

  // Utility per creare una griglia 9x9 con proprietà di base
  const createGrid = () => {
    const grid = []
    for (let i = 0; i < 9; i++) {
      const row = []
      for (let j = 0; j < 9; j++) {
        row.push({
          value: '-',
          readOnly: false,
          isGreen: false,
          isRed: false
        })
      }
      grid.push(row)
    }
    return grid
  }

  beforeEach(() => {
    wrapper = mount(SudokuGrid, {
      props: {
        grid: createGrid(),
        coloredCell: null,
        final: false
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('emette "cell-updated" con dati validi', async () => {
    // row=0, col=0 => index=0
    const rowIndex = 0
    const colIndex = 0
    const index = rowIndex * 9 + colIndex
    const testValue = '5'

    // Invochiamo la nuova onCellInput(index, value)
    await wrapper.vm.onCellInput(index, testValue)

    // Verifichiamo che abbia emesso "cell-updated"
    expect(wrapper.emitted('cell-updated')).toBeTruthy()
    const emitted = wrapper.emitted('cell-updated')[0][0]
    expect(emitted).toEqual({ row: 0, col: 0, value: 5 })

    // Controlliamo la lastCell
    expect(wrapper.vm.lastCell).toEqual({
      row: rowIndex,
      col: colIndex,
      isCorrect: true
    })
  })

  it('non emette "cell-updated" per input non valido e resetta valore', () => {
    // row=0, col=1 => index=1
    const rowIndex = 0
    const colIndex = 1
    const index = rowIndex * 9 + colIndex

    // Impostiamo un valore iniziale
    wrapper.vm.grid[rowIndex][colIndex].value = 'a'

    // Chiamiamo onCellInput con 'a' (non valido)
    wrapper.vm.onCellInput(index, 'a')

    // Non dovrebbe emettere nulla
    expect(wrapper.emitted('cell-updated')).toBeFalsy()

    // La cella deve essere resettata a ''
    expect(wrapper.vm.grid[rowIndex][colIndex].value).toBe('')
    expect(wrapper.vm.lastCell).toEqual({
      row: rowIndex,
      col: colIndex,
      isCorrect: false
    })
  })

  it('calcola la classe della cella correttamente con bordi (2,2)', () => {
    // row=2, col=2 => index=2*9 + 2 = 20
    const classes = wrapper.vm.getCellClass(20)
    expect(classes).toMatchObject({
      cell: true,
      'cell-border-right': true,
      'cell-border-bottom': true,
      'cell-readonly': false
    })
  })

  it('calcola la classe della cella correttamente senza bordi (0,0)', () => {
    // row=0, col=0 => index=0
    const classes = wrapper.vm.getCellClass(0)
    expect(classes).toMatchObject({
      cell: true,
      'cell-border-right': false,
      'cell-border-bottom': false,
      'cell-readonly': false
    })
  })

  it('assegna correttamente last-correct / last-incorrect', () => {
    // Impostiamo la lastCell manualmente
    wrapper.vm.lastCell = { row: 1, col: 1, isCorrect: true }
    // row=1, col=1 => index=10
    let classes = wrapper.vm.getCellClass(10)

    // Dovrebbe essere last-correct
    expect(classes['last-correct']).toBe(true)
    expect(classes['last-incorrect']).toBe(false)

    // Ora cambiamo lastCell.isCorrect = false
    wrapper.vm.lastCell.isCorrect = false
    classes = wrapper.vm.getCellClass(10)

    // Dovrebbe essere last-incorrect
    expect(classes['last-correct']).toBe(false)
    expect(classes['last-incorrect']).toBe(true)

    // Se chiediamo la classe di un'altra cella, non risulta correct/incorrect
    classes = wrapper.vm.getCellClass(0)
    expect(classes['last-correct']).toBeFalsy()
    expect(classes['last-incorrect']).toBeFalsy()
  })
})
