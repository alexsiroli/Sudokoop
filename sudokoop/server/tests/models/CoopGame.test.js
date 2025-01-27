jest.mock('sudoku-gen', () => ({
    getSudoku: jest.fn(() => ({
        puzzle: '12-456-89'.repeat(9), solution: '123456789'.repeat(9),
    })),
}));

const gameController = require('../../controllers/gameController');
const LobbyController = require("../../controllers/lobbyController");


describe("CoopGame", () => {
    let lobby, lobbyController, players;
    beforeEach(() => {
        lobbyController = new LobbyController();
        lobby = lobbyController.createLobby('masterUser');
        lobbyController.joinLobby(lobby.code, 'player1');
        lobbyController.joinLobby(lobby.code, 'player2');
        gameController.createCoopGame(lobby.code, 'easy');
        players = lobbyController.getPlayersOfLobby(lobby.code);
    });


    it('Game class initializes correctly', () => {
        const coopGame = gameController.getGameOfLobby(lobby.code);
        expect(coopGame.game.sudoku.puzzle).toBe('12-456-89'.repeat(9));
        expect(coopGame.game.emptyPlace).toBe(2 * 9);
        expect(coopGame.game.gameOver).toBe(false);
        expect(coopGame.game.vite).toBe(3);
    });

    it('Insert number correctly', () => {
        const cellData = {row: 0, col: 2, value: 3}
        const resultCorrect = gameController.insertNumberMulti(cellData, lobby.code);
        expect(resultCorrect.message).toBe('Giusto!');
    });

    it('If a player is removed from coopGame, he is also removed from lobby', () => {
        gameController.removePlayerFromGame(lobby.code, 'player2');
        let newPlayers = [{username: 'masterUser', isMaster: true},
            {username: 'player1', isMaster: false}];
        expect(gameController.getPlayersOfGame(lobby.code)).toEqual(newPlayers);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual(newPlayers);
        gameController.removePlayerFromGame(lobby.code, 'player2');
        expect(gameController.getPlayersOfGame(lobby.code)).toEqual(newPlayers);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual(newPlayers);
        gameController.removePlayerFromGame(lobby.code, 'player1');
        expect(gameController.getPlayersOfGame(lobby.code)).toEqual([{username: 'masterUser', isMaster: true}]);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual([{username: 'masterUser', isMaster: true}]);
    });

    it('master changes if removed', () => {
        gameController.removePlayerFromGame(lobby.code, 'masterUser');
        let newPlayers = [{username: 'player1', isMaster: true},
            {username: 'player2', isMaster: false}];
        expect(gameController.getPlayersOfGame(lobby.code)).toEqual(newPlayers);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual(newPlayers);
    });

    it('if player join lobby after start of match, he is not inside the game', () => {
        const oldPlayers = [{username: 'masterUser', isMaster: true},
            {username: 'player1', isMaster: false}, {username: 'player2', isMaster: false}];
        expect(gameController.getPlayersOfGame(lobby.code)).toEqual(oldPlayers);
        expect(gameController.getPlayersOfGame(lobby.code)).toEqual(lobbyController.getPlayersOfLobby(lobby.code));
        lobbyController.joinLobby(lobby.code, 'player3');
        expect(gameController.getPlayersOfGame(lobby.code)).toEqual(oldPlayers);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual(oldPlayers.concat(
            {username: 'player3', isMaster: false}));
    });

    it('created new coop game after ends of previous match', () => {
        gameController.createCoopGame(lobby.code, 'easy');
        const coopGame = gameController.getGameOfLobby(lobby.code);
        expect(coopGame.game.sudoku.puzzle).toBe('12-456-89'.repeat(9));
        expect(coopGame.game.emptyPlace).toBe(2 * 9);
        expect(coopGame.game.gameOver).toBe(false);
        expect(coopGame.game.vite).toBe(3);
    })
});