const gameController = require('../controllers/gameController');
const Game = require('../models/Game');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

jest.mock('../models/Leaderboard');
jest.mock('../models/User');
jest.mock('../models/Game');

describe('Game Controller', () => {
    let req, res;
    beforeEach(() => {
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
