jest.mock('sudoku-gen', () => ({
    getSudoku: jest.fn(() => ({
        puzzle: '12-456-89'.repeat(9), solution: '123456789'.repeat(9),
    })),
}));

const VersusGame = require('../../models/VersusGame');
const initializeGame = () => {
    return new VersusGame(
        'easy',
        [{ username: 'Player1', isMaster: true }],
        [
            { username: 'Player2', isMaster: false },
            { username: 'Player3', isMaster: false },
        ]
    );
};

it('Game class initializes correctly', () => {
    const versusGame = initializeGame();
    expect(versusGame.game.sudoku.puzzle).toBe('12-456-89'.repeat(9));
    expect(versusGame.game.emptyPlace).toBe(2 * 9);
    expect(versusGame.game.gameOver).toBe(false);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.yellow.points).toBe(0);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);
    expect(versusGame.blue.points).toBe(0);
});

it('Insert number correctly', () => {
    const versusGame = initializeGame();
    const resultCorrect = versusGame.insertNumber(0, 2, 3, 'Player1');
    expect(resultCorrect).toBe('Giusto!');
    expect(versusGame.yellow.points).toBe(1);
    expect(versusGame.blue.points).toBe(0);
    const resultCorrect2 = versusGame.insertNumber(1, 2, 3, 'Player2');
    expect(resultCorrect2).toBe('Giusto!');
    expect(versusGame.yellow.points).toBe(1);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(1);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);
});

it('Insert wrong number', () => {
    const versusGame = initializeGame();
    const resultWrong = versusGame.insertNumber(0, 2, 4, 'Player2');
    expect(resultWrong).toBe('Sbagliato! Riprova.');
    expect(versusGame.yellow.points).toBe(0);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(0);
    expect(versusGame.blue.team).toEqual([{username: 'Player3', isMaster: false}]);
});

it('Lost', () => {
    const versusGame = initializeGame();
    const resultWrong = versusGame.insertNumber(0, 2, 4, 'Player1');
    expect(resultWrong).toBe('Blu vince!');
    expect(versusGame.yellow.points).toBe(0);
    expect(versusGame.yellow.team).toEqual([]);
    expect(versusGame.blue.points).toBe(0);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);
});

it('Win', () => {
    const versusGame = initializeGame();

    for (i = 0; i < 9; i++) {
        const resultCorrect = versusGame.insertNumber(i, 2, 3, 'Player1');
        expect(resultCorrect).toBe('Giusto!');
    }
    expect(versusGame.yellow.points).toBe(9);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(0);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

    for (i = 0; i < 8; i++) {
        const resultCorrect = versusGame.insertNumber(i, 6, 7, 'Player3');
        expect(resultCorrect).toBe('Giusto!');
    }
    expect(versusGame.yellow.points).toBe(9);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(8);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

    // inserisco correttamente l ultimo numero: verifico che ho vinto con 3 vite
    const resultCorrect = versusGame.insertNumber(8, 6, 7, 'Player1');
    expect(resultCorrect).toBe('Gialla vince!');
    expect(versusGame.yellow.points).toBe(10);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(8);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

})

it('Parity', () => {
    const versusGame = initializeGame();
    for (i = 0; i < 9; i++) {
        const resultCorrect = versusGame.insertNumber(i, 2, 3, 'Player1');
        expect(resultCorrect).toBe('Giusto!');
    }
    expect(versusGame.yellow.points).toBe(9);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(0);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

    for (i = 0; i < 8; i++) {
        const resultCorrect = versusGame.insertNumber(i, 6, 7, 'Player3');
        expect(resultCorrect).toBe('Giusto!');
    }
    expect(versusGame.yellow.points).toBe(9);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(8);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

    // inserisco correttamente l ultimo numero: verifico che ho vinto con 3 vite
    const resultCorrect = versusGame.insertNumber(8, 6, 7, 'Player2');
    expect(resultCorrect).toBe('Pareggio!');
    expect(versusGame.yellow.points).toBe(9);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(9);
    expect(versusGame.blue.team).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

});

it('Exit of player during a match', () => {
    const versusGame = initializeGame();
    const resultCorrect = versusGame.insertNumber(0, 2, 3, 'Player1');
    expect(resultCorrect).toBe('Giusto!');
    const removeResult = versusGame.removePlayer('Player2');
    expect(removeResult).toBe(false);
    expect(versusGame.yellow.points).toBe(1);
    expect(versusGame.yellow.team).toEqual([{username: 'Player1', isMaster: true}]);
    expect(versusGame.blue.points).toBe(0);
    expect(versusGame.blue.team).toEqual([{username: 'Player3', isMaster: false}]);
    const removeResult2 = versusGame.removePlayer('Player1');
    expect(removeResult2).toBe('Blu vince!');
    expect(versusGame.yellow.points).toBe(1);
    expect(versusGame.yellow.team).toEqual([]);
    expect(versusGame.blue.points).toBe(0);
    expect(versusGame.blue.team).toEqual([ {username: 'Player3', isMaster: false}]);

})