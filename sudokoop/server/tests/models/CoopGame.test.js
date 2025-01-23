jest.mock('sudoku-gen', () => ({
    getSudoku: jest.fn(() => ({
        puzzle: '12-456-89'.repeat(9), solution: '123456789'.repeat(9),
    })),
}));

const CoopGame = require('../../models/CoopGame');
const LobbyController = require("../../controllers/lobbyController");
const Player = require("../../models/Player");

describe("CoopGame", () => {
    let lobby, coopGame, lobbyController;
    beforeEach(() => {
        lobbyController = new LobbyController();
        lobby = lobbyController.createLobby('masterUser');
        lobbyController.joinLobby(lobby.code, 'player1');
        lobbyController.joinLobby(lobby.code, 'player2');
        coopGame = new CoopGame('easy', lobby.code);
    });


it('Game class initializes correctly', () => {
    expect(coopGame.game.sudoku.puzzle).toBe('12-456-89'.repeat(9));
    expect(coopGame.game.emptyPlace).toBe(2 * 9);
    expect(coopGame.game.gameOver).toBe(false);
    expect(coopGame.game.vite).toBe(3);
});

it('Insert number correctly', () => {
    const resultCorrect = coopGame.insertNumber(0, 2, 3);
    expect(resultCorrect.message).toBe('Giusto!');
});

it('removePlayer', () => {
    coopGame.removePlayer('player2');
    let newPlayers = [{username: 'masterUser', isMaster: true},
        {username: 'player1', isMaster: false}];
    expect(coopGame.getPlayers()).toEqual(newPlayers);
    expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual(newPlayers);
    coopGame.removePlayer('player2');
    expect(coopGame.getPlayers()).toEqual(newPlayers);
    expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual(newPlayers);
    coopGame.removePlayer('player1');
    expect(coopGame.getPlayers()).toEqual([{username: 'masterUser', isMaster: true}]);
    expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual([{username: 'masterUser', isMaster: true}]);
});

    it('master changes if removed', () => {
        coopGame.removePlayer('masterUser');
        let newPlayers = [{username: 'player1', isMaster: true},
        {username: 'player2', isMaster: false}];
        expect(coopGame.getPlayers()).toEqual(newPlayers);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual(newPlayers);
    });

    it('if player join lobby after start of match, he is not inside the game', () => {
        const oldPlayers = [{username: 'masterUser', isMaster: true},
            {username: 'player1', isMaster: false}, {username: 'player2', isMaster: false}];
        expect(coopGame.getPlayers()).toEqual(oldPlayers);
        expect(coopGame.getPlayers()).toEqual(lobbyController.getPlayersOfLobby(lobby.code));
        lobbyController.joinLobby(lobby.code, 'player3');
        expect(coopGame.getPlayers()).toEqual(oldPlayers);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual(oldPlayers.concat(
            {username: 'player3', isMaster: false}));
    } )
});