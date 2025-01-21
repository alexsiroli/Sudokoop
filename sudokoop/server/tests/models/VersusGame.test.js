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
    expect(resultCorrect.message).toBe('Giusto!');
    expect(resultCorrect.yellowPoint).toBe(1);
    expect(resultCorrect.bluePoint).toBe(0);
    const resultCorrect2 = versusGame.insertNumber(1, 2, 3, 'Player2');
    expect(resultCorrect2.message).toBe('Giusto!');
    expect(resultCorrect2.yellowPoint).toBe(1);
    expect(resultCorrect2.yellowTeam).toEqual([{username: 'Player1', isMaster: true}]);
    expect(resultCorrect2.bluePoint).toBe(1);
    expect(resultCorrect2.blueTeam).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);
});

it('Insert wrong number', () => {
    const versusGame = initializeGame();
    const resultWrong = versusGame.insertNumber(0, 2, 4, 'Player2');
    expect(resultWrong.message).toBe('Sbagliato! Riprova.');
    expect(resultWrong.yellowPoint).toBe(0);
    expect(resultWrong.yellowTeam).toEqual([{username: 'Player1', isMaster: true}]);
    expect(resultWrong.bluePoint).toBe(0);
    expect(resultWrong.blueTeam).toEqual([{username: 'Player3', isMaster: false}]);
});

it('Lost', () => {
    const versusGame = initializeGame();
    const resultWrong = versusGame.insertNumber(0, 2, 4, 'Player1');
    expect(resultWrong.message).toBe('Blu vince!');
    expect(resultWrong.yellowPoint).toBe(0);
    expect(resultWrong.yellowTeam).toEqual([]);
    expect(resultWrong.bluePoint).toBe(0);
    expect(resultWrong.blueTeam).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);
});

it('Win', () => {
    const versusGame = initializeGame();
    let resultCorrect = null;
    for (i = 0; i < 9; i++) {
        resultCorrect = versusGame.insertNumber(i, 2, 3, 'Player1');
        expect(resultCorrect.message).toBe('Giusto!');
    }
    expect(resultCorrect.yellowPoint).toBe(9);
    expect(resultCorrect.yellowTeam).toEqual([{username: 'Player1', isMaster: true}]);
    expect(resultCorrect.bluePoint).toBe(0);
    expect(resultCorrect.blueTeam).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

    for (i = 0; i < 8; i++) {
        resultCorrect = versusGame.insertNumber(i, 6, 7, 'Player3');
        expect(resultCorrect.message).toBe('Giusto!');
    }
    expect(resultCorrect.yellowPoint).toBe(9);
    expect(resultCorrect.yellowTeam).toEqual([{username: 'Player1', isMaster: true}]);
    expect(resultCorrect.bluePoint).toBe(8);
    expect(resultCorrect.blueTeam).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

    // inserisco correttamente l ultimo numero: verifico che ho vinto con 3 vite
    resultCorrect = versusGame.insertNumber(8, 6, 7, 'Player1');
    expect(resultCorrect.message).toBe('Gialla vince!');
    expect(resultCorrect.yellowPoint).toBe(10);
    expect(resultCorrect.yellowTeam).toEqual([{username: 'Player1', isMaster: true}]);
    expect(resultCorrect.bluePoint).toBe(8);
    expect(resultCorrect.blueTeam).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

})

it('Parity', () => {
    const versusGame = initializeGame();
    let resultCorrect = null;
    for (i = 0; i < 9; i++) {
        resultCorrect = versusGame.insertNumber(i, 2, 3, 'Player1');
        expect(resultCorrect.message).toBe('Giusto!');
    }
    expect(resultCorrect.yellowPoint).toBe(9);
    expect(resultCorrect.yellowTeam).toEqual([{username: 'Player1', isMaster: true}]);
    expect(resultCorrect.bluePoint).toBe(0);
    expect(resultCorrect.blueTeam).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

    for (i = 0; i < 8; i++) {
        resultCorrect = versusGame.insertNumber(i, 6, 7, 'Player3');
        expect(resultCorrect.message).toBe('Giusto!');
    }
    expect(resultCorrect.yellowPoint).toBe(9);
    expect(resultCorrect.yellowTeam).toEqual([{username: 'Player1', isMaster: true}]);
    expect(resultCorrect.bluePoint).toBe(8);
    expect(resultCorrect.blueTeam).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

    // inserisco correttamente l ultimo numero: verifico che ho vinto con 3 vite
    resultCorrect = versusGame.insertNumber(8, 6, 7, 'Player2');
    expect(resultCorrect.message).toBe('Pareggio!');
    expect(resultCorrect.yellowPoint).toBe(9);
    expect(resultCorrect.yellowTeam).toEqual([{username: 'Player1', isMaster: true}]);
    expect(resultCorrect.bluePoint).toBe(9);
    expect(resultCorrect.blueTeam).toEqual([{username: 'Player2', isMaster: false}, {username: 'Player3', isMaster: false}]);

});

it('Exit of player during a match', () => {
    const versusGame = initializeGame();
    const resultCorrect = versusGame.insertNumber(0, 2, 3, 'Player1');
    expect(resultCorrect.message).toBe('Giusto!');
    const removeResult = versusGame.removePlayer('Player2');
    expect(removeResult).toBe("");
    const removeResult2 = versusGame.removePlayer('Player1');
    expect(removeResult2).toBe('Blu vince!');

})