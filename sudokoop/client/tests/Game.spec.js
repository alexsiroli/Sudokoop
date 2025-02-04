import {flushPromises, mount} from '@vue/test-utils';
import Game from '@/views/Game.vue';
import axios from '@/main.js';
import SudokuGrid from '@/components/SudokuGrid.vue';
import Leaderboard from '@/components/Leaderboard.vue';

jest.mock('@/main.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('Game.vue', () => {
  let wrapper;
  let routerPushMock;

  beforeEach(() => {
    routerPushMock = jest.fn();

    wrapper = mount(Game, {
      global: {
        mocks: {
          $router: {
            push: routerPushMock,
          },
          $route: {
            query: {difficulty: 'easy'}
          }
        },
        stubs: {
          SudokuGrid,
          Leaderboard,
        }
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('inizializza correttamente con difficoltà dal router', () => {
    expect(wrapper.vm.difficulty).toBe('easy');
  });

  it('calcola correttamente la proprietà computed hearts', async () => {
    await wrapper.setData({vite: 3});
    expect(wrapper.vm.hearts).toBe('❤️❤️❤️');
  });

  it('chiama startNewGame al mounted', async () => {
    // Simula una risposta risolta per axios.get
    axios.get.mockResolvedValue({
      data: {
        gameId: 'dummy',
        vite: 3,
        puzzle: '-'.repeat(81)
      }
    });

    const startNewGameSpy = jest.spyOn(Game.methods, 'startNewGame');

    const localWrapper = mount(Game, {
      global: {
        mocks: {
          $router: {
            push: routerPushMock,
          },
          $route: {
            query: {difficulty: 'easy'}
          }
        },
        stubs: {
          SudokuGrid,
          Leaderboard,
        }
      }
    });

    // Attende che le promesse pendenti vengano risolte
    await flushPromises();
    await localWrapper.vm.$nextTick();

    expect(startNewGameSpy).toHaveBeenCalled();
    startNewGameSpy.mockRestore();
  });

  it('gestisce l\'aggiornamento di una cella con successo', async () => {
    const cellData = {row: 0, col: 0, value: 5};
    wrapper.setData({gameId: 'game1'});

    axios.post.mockResolvedValue({
      data: {
        vite: 3,
        gameOver: false,
        message: 'Giusto!',
        puzzle: 'newpuzzle',
      }
    });

    // Stub per initializeGrid per evitare l'esecuzione della logica interna
    const initializeGridStub = jest.fn();
    wrapper.vm.initializeGrid = initializeGridStub;

    await wrapper.vm.handleCellUpdate(cellData);

    expect(axios.post).toHaveBeenCalledWith('/game/insert', {
      gameId: 'game1',
      row: 0,
      col: 0,
      value: 5
    });
    expect(wrapper.vm.vite).toBe(3);
    expect(initializeGridStub).toHaveBeenCalledWith('newpuzzle');
  });

  it('gestisce errori nell\'inserimento del numero', async () => {
    const cellData = {row: 0, col: 0, value: 5};
    wrapper.setData({gameId: 'game1'});

    axios.post.mockRejectedValue(new Error('Network Error'));
    console.error = jest.fn();

    await wrapper.vm.handleCellUpdate(cellData);

    expect(console.error).toHaveBeenCalledWith("Errore nell'inserimento del numero:", expect.any(Error));
  });

  it('formatta il tempo correttamente', () => {
    wrapper.setData({timeSpent: 125000}); // 2 minuti e 5 secondi
    expect(wrapper.vm.formattedTime).toBe('02:05');
  });

  it('naviga alla home con goToHome', () => {
    wrapper.vm.goToHome();
    expect(routerPushMock).toHaveBeenCalledWith("/home");
  });

  // Test aggiuntivi per i metodi non ancora coperti

  it('toggleLeaderboard alterna correttamente showLeaderboard', () => {
    expect(wrapper.vm.showLeaderboard).toBe(false);
    wrapper.vm.toggleLeaderboard();
    expect(wrapper.vm.showLeaderboard).toBe(true);
    wrapper.vm.toggleLeaderboard();
    expect(wrapper.vm.showLeaderboard).toBe(false);
  });

  it('startTimer e stopTimer funzionano correttamente', () => {
    jest.useFakeTimers();

    // Inizializza una variabile per simulare il tempo corrente
    let now = 0;
    global.Date.now = jest.fn(() => now);

    wrapper.vm.startTimer();
    expect(wrapper.vm.timerInterval).not.toBeNull();

    // Simula il passare di 500 ms
    now += 500;
    jest.advanceTimersByTime(500);

    // Verifica che timeSpent sia aggiornato (>= 500)
    const timeAfter500ms = wrapper.vm.timeSpent;
    expect(timeAfter500ms).toBeGreaterThanOrEqual(500);

    wrapper.vm.stopTimer();
    expect(wrapper.vm.timerInterval).toBeNull();

    jest.useRealTimers();
  });

  it('saveTimeToLeaderboard chiama axios.post con parametri corretti', async () => {
    sessionStorage.setItem('username', 'testuser');
    axios.post.mockResolvedValue({});
    const timeMs = 123456;
    wrapper.vm.difficulty = 'easy';

    await wrapper.vm.saveTimeToLeaderboard(timeMs);

    expect(axios.post).toHaveBeenCalledWith('/game/time', {
      username: 'testuser',
      milliseconds: timeMs,
      difficulty: 'easy'
    });
  });

  it('gestisce errori in saveTimeToLeaderboard', async () => {
    const error = new Error('Network error');
    axios.post.mockRejectedValue(error);
    console.error = jest.fn();
    sessionStorage.setItem('username', 'testuser');

    await wrapper.vm.saveTimeToLeaderboard(1000);

    expect(console.error).toHaveBeenCalledWith("Errore nel salvataggio del tempo:", error);
  });

  it('inizializza correttamente la griglia con initializeGrid', () => {
    const puzzle = '1'.repeat(81); // puzzle completamente riempito con '1'
    wrapper.vm.initializeGrid(puzzle);

    const grid = wrapper.vm.sudokuGrid;
    expect(grid.length).toBe(9);
    grid.forEach(row => {
      expect(row.length).toBe(9);
      row.forEach(cell => {
        expect(cell.value).toBe('1');
        expect(cell.readOnly).toBe(true);
      });
    });
  });

  it('inizializza correttamente la griglia con soluzione con initializeGridWithSolution', () => {
    // Imposta una griglia precedente e un puzzle iniziale
    wrapper.setData({
      sudokuGrid: Array(9).fill(null).map(() => Array(9).fill({color: 'white'})),
      initialPuzzle: '-'.repeat(81)
    });

    const puzzle = '-'.repeat(81);
    const solution = '1'.repeat(81);
    wrapper.vm.initializeGridWithSolution(solution);

    const grid = wrapper.vm.sudokuGrid;
    expect(grid.length).toBe(9);
    grid.forEach(row => {
      expect(row.length).toBe(9);
      row.forEach(cell => {
        // Poiché initialPuzzle è '-', le celle devono essere riempite con la soluzione
        expect(cell.value).toBe('1');
        expect(cell.readOnly).toBe(true);
      });
    });
  });
});
