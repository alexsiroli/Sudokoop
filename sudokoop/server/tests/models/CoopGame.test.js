jest.mock('sudoku-gen', () => ({
    getSudoku: jest.fn(() => ({
        puzzle: '12-456-89'.repeat(9), solution: '123456789'.repeat(9),
    })),
}));

const CoopGame = require('../../models/CoopGame');
const initializeGame = () => {
    return new CoopGame('easy', [{username: 'Player1', isMaster: true},
        {username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);
};

it('Game class initializes correctly', () => {
    const coopGame = initializeGame();
    expect(coopGame.game.sudoku.puzzle).toBe('12-456-89'.repeat(9));
    expect(coopGame.game.emptyPlace).toBe(2 * 9);
    expect(coopGame.game.gameOver).toBe(false);
    expect(coopGame.game.vite).toBe(3);
});

it('Insert number correctly', () => {
    const coopGame = initializeGame();
    const resultCorrect = coopGame.insertNumber(0, 2, 3);
    expect(resultCorrect).toBe('Giusto!');
});

it('removePlayer', () => {
    const coopGame = initializeGame();
    coopGame.removePlayer('Player2');
    expect(coopGame.getPlayers()).toEqual([{username: 'Player1', isMaster: true},
        {username: 'Player3', isMaster: false}]);

    coopGame.removePlayer('Player4');
    expect(coopGame.getPlayers()).toEqual([{username: 'Player1', isMaster: true},
        {username: 'Player3', isMaster: false}]);
})