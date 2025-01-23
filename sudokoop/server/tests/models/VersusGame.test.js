jest.mock('sudoku-gen', () => ({
    getSudoku: jest.fn(() => ({
        puzzle: '12-456-89'.repeat(9), solution: '123456789'.repeat(9),
    })),
}));

const LobbyController = require("../../controllers/lobbyController");
const GameController = require("../../controllers/gameController");

let lobby, players, lobbyController, gameController;
beforeEach(() => {
    lobbyController = new LobbyController();
    gameController = new GameController();
    lobby = lobbyController.createLobby('masterUser');
    lobbyController.joinLobby(lobby.code, 'player1');
    lobbyController.joinLobby(lobby.code, 'player2');
    gameController.createTeamManager(lobby.code);
    players = lobbyController.getPlayersOfLobby(lobby.code);
});
describe("Selection of teams in Versus Game", () => {

    it("aggiunge un giocatore al team del colore specificato", () => {
        let res = gameController.addPlayerToTeam(lobby.code, 'yellow',
            players[0]);
        expect(res.yellowTeam).toEqual([players[0]]);
        expect(res.blueTeam).toEqual([]);
        res = gameController.addPlayerToTeam(lobby.code, 'blue',
            players[1])
        expect(res.yellowTeam).toEqual([players[0]]);
        expect(res.blueTeam).toEqual([players[1]]);
    });

    it("se un giocatore si unisce a un team mentre era in un altro, viene rimosso dal primo e aggiunto" +
        "al secondo", () => {
        let res = gameController.addPlayerToTeam(lobby.code, 'yellow',
            players[0])
        expect(res.yellowTeam).toEqual([players[0]]);
        expect(res.blueTeam).toEqual([]);
        res = gameController.addPlayerToTeam(lobby.code, 'blue',
            players[0])
        expect(res.yellowTeam).toEqual([]);
        expect(res.blueTeam).toEqual([players[0]]);
    });

    it("restituisce false (versus non può iniziare) se ogni giocatore non ha scelto una squadra", () => {
        let res = gameController.addPlayerToTeam(lobby.code, 'yellow',
            players[0])
        expect(res.yellowTeam).toEqual([players[0]]);
        expect(res.blueTeam).toEqual([]);
        const check = gameController.versusGameCanStart(lobby.code);
        expect(check.res).toBeFalsy();
        expect(check.message).toBe("Tutti i giocatori devono scegliere una squadra");
    });

    it("restituisce false (versus non può iniziare) se ogni squadra non ha almeno un giocatore", () => {
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[0]);
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[1]);
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[2]);
        const check = gameController.versusGameCanStart(lobby.code);
        expect(check.res).toBeFalsy();
        expect(check.message).toBe("Ogni squadra deve avere almeno un giocatore");
    });
    it("restituisce true (versus può iniziare) se ogni team ha almeno un giocatore e tutti" +
        "sono in una squadra ", () => {
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[0]);
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[1]);
        gameController.addPlayerToTeam(lobby.code, 'blue', players[2]);
        gameController.addPlayerToTeam(lobby.code, 'blue', players[0]);
        const check = gameController.versusGameCanStart(lobby.code);
        expect(check.res).toBeTruthy();
    });

});

describe("player left lobby during team selection", () => {

    it("dopo essere uscito, il giocatore deve essere rimosso dal team", () => {
        let res = gameController.addPlayerToTeam(lobby.code, 'yellow', players[0])
        expect(res.yellowTeam).toEqual([players[0]]);
        expect(res.blueTeam).toEqual([]);
        res = gameController.removePlayerFromTeam(lobby.code, players[0]);
        expect(res.yellowTeam).toEqual([]);
        expect(res.blueTeam).toEqual([]);
    });

    it("dopo essere uscito, la lista di tutti i giocatori deve aggiornarsi per il corretto " +
        "check dell'inizio della partita", () => {
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[0]);
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[1]);
        gameController.addPlayerToTeam(lobby.code, 'blue', players[2]);
        gameController.addPlayerToTeam(lobby.code, 'blue', players[0]);
        let check = gameController.versusGameCanStart(lobby.code);
        expect(check.res).toBeTruthy();
        res = gameController.removePlayerFromTeam(lobby.code, players[0]);
        expect(res.yellowTeam).toEqual([players[1]]);
        expect(res.blueTeam).toEqual([players[2]]);
        check = gameController.versusGameCanStart(lobby.code);
        expect(check.res).toBeTruthy();
    });

});


describe("Logic of Versus Game", () => {

    beforeEach(() => {
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[0]);
        gameController.addPlayerToTeam(lobby.code, 'yellow', players[1]);
        gameController.addPlayerToTeam(lobby.code, 'blue', players[2]);
        gameController.addPlayerToTeam(lobby.code, 'blue', players[0]);
        gameController.createVersusGame(lobby.code, 'easy');
    });
    it('Game class initializes correctly', () => {

        const versusGame = gameController.getGameOfLobby(lobby.code);
        expect(versusGame.game.sudoku.puzzle).toBe('12-456-89'.repeat(9));
        expect(versusGame.game.emptyPlace).toBe(2 * 9);
        expect(versusGame.game.gameOver).toBe(false);
        expect(versusGame.yellow.team).toEqual([{username: 'player1', isMaster: false}]);
        expect(versusGame.yellow.points).toBe(0);
        expect(versusGame.blue.team).toEqual([{username: 'player2', isMaster: false}, {
            username: 'masterUser', isMaster: true
        }]);
        expect(versusGame.blue.points).toBe(0);
    });

    it('Insert number correctly', () => {
        let cellData = {row: 0, col: 2, value: 3}
        const resultCorrect = gameController.insertNumberMulti(cellData, lobby.code, 'player1');
        expect(resultCorrect.message).toBe('Giusto!');
        expect(resultCorrect.yellowPoint).toBe(1);
        expect(resultCorrect.bluePoint).toBe(0);
        cellData = {row: 1, col: 2, value: 3}
        const resultCorrect2 = gameController.insertNumberMulti(cellData, lobby.code, 'player2');
        expect(resultCorrect2.message).toBe('Giusto!');
        expect(resultCorrect2.yellowPoint).toBe(1);
        expect(resultCorrect2.yellowTeam).toEqual([{username: 'player1', isMaster: false}]);
        expect(resultCorrect2.bluePoint).toBe(1);
        expect(resultCorrect2.blueTeam).toEqual([{username: 'player2', isMaster: false}, {
            username: 'masterUser', isMaster: true
        }]);
    });

    it('Insert wrong number', () => {
        let cellData = {row: 0, col: 2, value: 4}
        const resultWrong = gameController.insertNumberMulti(cellData, lobby.code, 'player2');
        expect(resultWrong.message).toBe('Sbagliato! Riprova.');
        expect(resultWrong.yellowPoint).toBe(0);
        expect(resultWrong.yellowTeam).toEqual([{username: 'player1', isMaster: false}]);
        expect(resultWrong.bluePoint).toBe(0);
        expect(resultWrong.blueTeam).toEqual([{username: 'masterUser', isMaster: true}]);
    });

    it('Lost', () => {
        let cellData = {row: 0, col: 2, value: 4}
        const resultWrong = gameController.insertNumberMulti(cellData, lobby.code, 'player1');
        expect(resultWrong.message).toBe('Blu vince!');
        expect(resultWrong.yellowPoint).toBe(0);
        expect(resultWrong.yellowTeam).toEqual([]);
        expect(resultWrong.bluePoint).toBe(0);
        expect(resultWrong.blueTeam).toEqual([{username: 'player2', isMaster: false}, {
            username: 'masterUser', isMaster: true
        }]);
    });

    it('Win', () => {
        let resultCorrect, cellData;
        for (i = 0; i < 9; i++) {
            cellData = {row: i, col: 2, value: 3};
            resultCorrect = gameController.insertNumberMulti(cellData, lobby.code, 'player1');
            expect(resultCorrect.message).toBe('Giusto!');
        }
        expect(resultCorrect.yellowPoint).toBe(9);
        expect(resultCorrect.yellowTeam).toEqual([{username: 'player1', isMaster: false}]);
        expect(resultCorrect.bluePoint).toBe(0);
        expect(resultCorrect.blueTeam).toEqual([{username: 'player2', isMaster: false}, {
            username: 'masterUser', isMaster: true
        }]);

        for (i = 0; i < 8; i++) {
            cellData = {row: i, col: 6, value: 7};
            resultCorrect = gameController.insertNumberMulti(cellData, lobby.code, 'player2');
            expect(resultCorrect.message).toBe('Giusto!');
        }
        expect(resultCorrect.yellowPoint).toBe(9);
        expect(resultCorrect.yellowTeam).toEqual([{username: 'player1', isMaster: false}]);
        expect(resultCorrect.bluePoint).toBe(8);
        expect(resultCorrect.blueTeam).toEqual([{username: 'player2', isMaster: false}, {
            username: 'masterUser', isMaster: true
        }]);

        // inserisco correttamente l ultimo numero: verifico che ho vinto con 3 vite
        cellData = {row: 8, col: 6, value: 7};
        resultCorrect = gameController.insertNumberMulti(cellData, lobby.code, 'player1');
        expect(resultCorrect.message).toBe('Gialla vince!');
        expect(resultCorrect.yellowPoint).toBe(10);
        expect(resultCorrect.yellowTeam).toEqual([{username: 'player1', isMaster: false}]);
        expect(resultCorrect.bluePoint).toBe(8);
        expect(resultCorrect.blueTeam).toEqual([{username: 'player2', isMaster: false}, {
            username: 'masterUser', isMaster: true
        }]);
    })

    it('Parity', () => {
        let resultCorrect, cellData;
        for (i = 0; i < 9; i++) {
            cellData = {row: i, col: 2, value: 3};
            resultCorrect = gameController.insertNumberMulti(cellData, lobby.code, 'player1');
            expect(resultCorrect.message).toBe('Giusto!');
        }
        expect(resultCorrect.yellowPoint).toBe(9);
        expect(resultCorrect.bluePoint).toBe(0);

        for (i = 0; i < 8; i++) {
            cellData = {row: i, col: 6, value: 7};
            resultCorrect = gameController.insertNumberMulti(cellData, lobby.code, 'player2');
            expect(resultCorrect.message).toBe('Giusto!');
        }
        expect(resultCorrect.yellowPoint).toBe(9);
        expect(resultCorrect.bluePoint).toBe(8);

        // inserisco correttamente l ultimo numero: verifico che ho vinto con 3 vite
        cellData = {row: 8, col: 6, value: 7};
        resultCorrect = gameController.insertNumberMulti(cellData, lobby.code, 'player2');
        expect(resultCorrect.message).toBe('Pareggio!');
        expect(resultCorrect.yellowPoint).toBe(9);
        expect(resultCorrect.yellowTeam).toEqual([{username: 'player1', isMaster: false}]);
        expect(resultCorrect.bluePoint).toBe(9);
        expect(resultCorrect.blueTeam).toEqual([{username: 'player2', isMaster: false}, {
            username: 'masterUser', isMaster: true
        }]);

    });

    it('Exit of player during a match. It should be deleted from teams and from lobby', () => {
        gameController.removePlayerFromGame(lobby.code, players[2]);
        expect(gameController.getTeamsOfGame(lobby.code).yellowTeam).toEqual([{username: 'player1', isMaster: false}]);
        expect(gameController.getTeamsOfGame(lobby.code).blueTeam).toEqual([{username: 'masterUser', isMaster: true}]);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual([{username: 'masterUser', isMaster: true},
            {username: 'player1', isMaster: false}]);
    });
    it('On master exit, someone becomes new master', () => {
        gameController.removePlayerFromGame(lobby.code, players[0]);
        expect(gameController.getTeamsOfGame(lobby.code).yellowTeam).toEqual([{username: 'player1', isMaster: true}]);
        expect(gameController.getTeamsOfGame(lobby.code).blueTeam).toEqual([{username: 'player2', isMaster: false}]);
        expect(lobbyController.getPlayersOfLobby(lobby.code)).toEqual([{username: 'player1', isMaster: true},
            {username: 'player2', isMaster: false}]);
    });
});