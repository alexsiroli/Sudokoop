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
    expect(resultCorrect.message).toBe('Giusto!');
    expect(resultCorrect.puzzle[2]).toBe('3');
    expect(resultCorrect.gameOver).toBe(false);
    expect(resultCorrect.vite).toBe(3);
});

it('Win', () => {
    const game = new GameWithVite('easy');

    // inserisco tutti 3
    for (i = 0; i < 9; i++) {
        const resultCorrect = game.insertNumber(i, 2, 3);
        expect(resultCorrect.message).toBe('Giusto!');
    }
    for (i = 0; i < 8; i++) {
        const resultCorrect = game.insertNumber(i, 6, 7);
        expect(resultCorrect.message).toBe('Giusto!');
    }
    // inserisco correttamente l ultimo numero: verifico che ho vinto con 3 vite
    const resultCorrect = game.insertNumber(8, 6, 7);
    expect(resultCorrect.message).toBe('Hai vinto!');
    expect(resultCorrect.puzzle).toBe(game.sudoku.solution);
    expect(resultCorrect.gameOver).toBe(true);
    expect(resultCorrect.vite).toBe(3);
});

it('Lost', () => {
    const game = new GameWithVite('easy');
    const resultWrong = game.insertNumber(0, 2, 4);
    expect(resultWrong.message).toBe('Sbagliato! Riprova.');
    expect(resultWrong.gameOver).toBe(false);
    expect(resultWrong.vite).toBe(2);
    const resultCorrect = game.insertNumber(0, 2, 3);
    expect(resultCorrect.message).toBe('Giusto!');
    expect(resultCorrect.gameOver).toBe(false);
    expect(resultCorrect.vite).toBe(2);
    const resultWrong2 = game.insertNumber(1, 2, 4);
    expect(resultWrong2.message).toBe('Sbagliato! Riprova.');
    expect(resultWrong2.gameOver).toBe(false);
    expect(resultWrong2.vite).toBe(1);
    const resultWrong3 = game.insertNumber(1, 2, 5);
    expect(resultWrong3.message).toBe('Hai perso! Vite terminate.');
    expect(resultWrong3.gameOver).toBe(true);
    expect(resultWrong3.vite).toBe(0);
})