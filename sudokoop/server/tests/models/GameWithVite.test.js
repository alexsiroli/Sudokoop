jest.mock('sudoku-gen', () => ({
    getSudoku: jest.fn(() => ({
        puzzle: '12-456-89'.repeat(9),
        solution: '123456789'.repeat(9),
    })),
}));
const GameWithVite = require('../../models/GameWithVite');


it('Game class initializes correctly', () => {
    const game = new GameWithVite('easy');

    expect(game.sudoku.puzzle).toBe('12-456-89'.repeat(9));
    expect(game.emptyPlace).toBe(2 * 9);
    expect(game.gameOver).toBe(false);
    expect(game.vite).toBe(3);
});

it('Insert number correctly', () => {
    const game = new GameWithVite('easy');

    const resultCorrect = game.insertNumber(0, 2, 3);
    expect(resultCorrect).toBe('Giusto!');
    expect(game.sudoku.puzzle[2]).toBe('3');
    expect(game.gameOver).toBe(false);
    expect(game.vite).toBe(3);
});

it('Win', () => {
    const game = new GameWithVite('easy');

    // inserisco tutti 3
    for (i = 0; i < 9; i++) {
        const resultCorrect = game.insertNumber(i, 2, 3);
        expect(resultCorrect).toBe('Giusto!');
    }
    for (i = 0; i < 8; i++) {
        const resultCorrect = game.insertNumber(i, 6, 7);
        expect(resultCorrect).toBe('Giusto!');
    }
    // inserisco correttamente l ultimo numero: verifico che ho vinto con 3 vite
    const resultCorrect = game.insertNumber(8, 6, 7);
    expect(resultCorrect).toBe('Hai vinto!');
    expect(game.sudoku.puzzle).toBe(game.sudoku.solution);
    expect(game.gameOver).toBe(true);
    expect(game.vite).toBe(3);
});

it('Lost', () => {
    const game = new GameWithVite('easy');
    const resultWrong = game.insertNumber(0, 2, 4);
    expect(resultWrong).toBe('Sbagliato! Riprova.');
    expect(game.gameOver).toBe(false);
    expect(game.vite).toBe(2);
    const resultCorrect = game.insertNumber(0, 2, 3);
    expect(resultCorrect).toBe('Giusto!');
    expect(game.gameOver).toBe(false);
    expect(game.vite).toBe(2);
    const resultWrong2 = game.insertNumber(1, 2, 4);
    expect(resultWrong2).toBe('Sbagliato! Riprova.');
    expect(game.gameOver).toBe(false);
    expect(game.vite).toBe(1);
    const resultWrong3 = game.insertNumber(1, 2, 5);
    expect(resultWrong3).toBe('Hai perso! Vite terminate.');
    expect(game.gameOver).toBe(true);
    expect(game.vite).toBe(0);
})