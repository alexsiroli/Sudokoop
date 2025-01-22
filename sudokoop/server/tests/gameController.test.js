const GameController = require('../controllers/gameController');
const Game  = require('../models/Game');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const LobbyController = require("../controllers/lobbyController");

jest.mock('../models/Leaderboard');
jest.mock('../models/User');
jest.mock('../models/Game');

describe('Game Controller', () => {
    let req, res;
    let lobbyController;
    let gameController;
    beforeEach(() => {
        lobbyController = new LobbyController();
        gameController = new GameController();
        req = { body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('saveTime', () => {
        it('restituisce 400 se username o milliseconds mancano', async () => {
            req.body = { difficulty: 'easy' };
            await gameController.saveTime(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).not.toHaveBeenCalledWith({ message: "Tempo salvato su DB" });
        });

        it('salva il tempo e restituisce 200 in caso di successo', async () => {
            req.body = { username: 'user1', milliseconds: 1000, difficulty: 'easy' };
            const saveMock = jest.fn().mockResolvedValue();
            Leaderboard.mockImplementation(() => ({ save: saveMock }));

            await gameController.saveTime(req, res);

            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Tempo salvato su DB" });
        });

        it('gestisce errori durante il salvataggio del tempo', async () => {
            req.body = { username: 'user1', milliseconds: 1000, difficulty: 'easy' };
            const saveMock = jest.fn().mockRejectedValue(new Error('DB error'));
            Leaderboard.mockImplementation(() => ({ save: saveMock }));

            await gameController.saveTime(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Errore interno nel salvataggio" }));
        });
    });

    describe('getLeaderboard', () => {
        it('restituisce i record della leaderboard', async () => {
            const records = [{ username: 'user1', milliseconds: 1000, difficulty: 'easy' }];
            Leaderboard.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(records) });

            await gameController.getLeaderboard(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(records);
        });

        it('gestisce errori durante il recupero della leaderboard', async () => {
            Leaderboard.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('DB error')) });

            await gameController.getLeaderboard(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Errore nel recupero della leaderboard" });
        });
    });

    describe('newSinglePlayerGame', () => {
        it('crea una nuova partita single player e restituisce i dati', () => {
            const originalGenerateGameId = gameController.generateGameId;
            req.query = { difficulty: 'medium' };
            gameController.generateGameId = jest.fn().mockReturnValue('game_test');

            const fakeSudoku = { puzzle: '---', solution: '123', difficulty: 'medium' };
            const fakeGameInstance = { sudoku: fakeSudoku, vite: 3 };
            Game.mockImplementation(() => fakeGameInstance);

            gameController.newSinglePlayerGame(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                gameId: 'game_test',
                puzzle: '---',
                vite: 3,
            });

            gameController.generateGameId = originalGenerateGameId;
        });
    });

    describe('generateGameId', () => {
        it('genera un ID di gioco valido', () => {
            const id = gameController.generateGameId();
            expect(id).toMatch(/^game_\d+_\d+$/);
        });
    });


    describe('createTeamsClass and addPlayerToTeam', () => {
        let lobby, players;

        beforeEach(() => {
            lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'player1');
            players = lobbyController.getPlayersOfLobby(lobby.code);
            gameController.createTeamsClass(lobby.code, players);
        });

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
    });

    describe('checkVersusGameCanStart', () => {
        let lobby, players;

        beforeEach(() => {
            lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'player1');
            lobbyController.joinLobby(lobby.code, 'player2');
            players = lobbyController.getPlayersOfLobby(lobby.code);
            gameController.createTeamsClass(lobby.code, players);
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
        let lobby, players;

        beforeEach(() => {
            lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'player1');
            lobbyController.joinLobby(lobby.code, 'player2');
            players = lobbyController.getPlayersOfLobby(lobby.code);
            gameController.createTeamsClass(lobby.code, players);
        });

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
            expect(res.yellowTeam).toEqual([ players[1]]);
            expect(res.blueTeam).toEqual([players[2]]);
            check = gameController.versusGameCanStart(lobby.code);
            expect(check.res).toBeTruthy();
        });

    });

    describe('updateStats', () => {
        it('restituisce 400 se username o result mancano', async () => {
            req.body = { username: 'user' };
            await gameController.updateStats(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('restituisce 404 se utente non trovato', async () => {
            req.body = { username: 'user1', result: 'win' };
            User.findOneAndUpdate.mockResolvedValue(null);
            await gameController.updateStats(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Utente non trovato" });
        });

        it('aggiorna le statistiche e restituisce 200 in caso di successo', async () => {
            req.body = { username: 'user1', result: 'win' };
            const updatedUser = { userName: 'user1', wins: 1, losses: 0 };
            User.findOneAndUpdate.mockResolvedValue(updatedUser);
            await gameController.updateStats(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Statistiche aggiornate" });
        });

        it('gestisce errori durante l\'aggiornamento delle statistiche', async () => {
            req.body = { username: 'user1', result: 'win' };
            User.findOneAndUpdate.mockRejectedValue(new Error('DB error'));
            await gameController.updateStats(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Errore interno" });
        });
    });

    describe('insertNumberWithoutCheck', () => {
        it('chiama insertNumberWithoutCheck sul gioco e restituisce il risultato', () => {
            const fakeGame = {
                insertNumberWithoutCheck: jest.fn().mockReturnValue('newPuzzle'),
            };
            const cellData = { row: 0, col: 0, value: 5 };
            const lobbyCode = 'LOBBY123';

            gameController.getGameOfLobby = jest.fn().mockReturnValue(fakeGame);

            const result = gameController.insertNumberWithoutCheck(cellData, lobbyCode);
            expect(result).toBe('newPuzzle');
            expect(fakeGame.insertNumberWithoutCheck).toHaveBeenCalledWith(0, 0, 5);
        });
    });
});