const GameController = require('../controllers/gameController');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const LobbyController = require("../controllers/lobbyController");

jest.mock('../models/Leaderboard');
jest.mock('../models/User');
jest.mock('sudoku-gen', () => ({
    getSudoku: jest.fn(() => ({
        puzzle: '12-456-89'.repeat(9), solution: '123456789'.repeat(9),
    })),
}));
describe('Game Controller', () => {
    let req, res;
    let lobbyController;
    let gameController;
    beforeEach(() => {
        lobbyController = new LobbyController();
        gameController = new GameController();
        req = {body: {}, query: {}};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('saveTime', () => {
        it('restituisce 400 se username o milliseconds mancano', async () => {
            req.body = {difficulty: 'easy'};
            await gameController.saveTime(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).not.toHaveBeenCalledWith({message: "Tempo salvato su DB"});
        });

        it('salva il tempo e restituisce 200 in caso di successo', async () => {
            req.body = {username: 'user1', milliseconds: 1000, difficulty: 'easy'};
            const saveMock = jest.fn().mockResolvedValue();
            Leaderboard.mockImplementation(() => ({save: saveMock}));

            await gameController.saveTime(req, res);

            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({message: "Tempo salvato su DB"});
        });

        it('gestisce errori durante il salvataggio del tempo', async () => {
            req.body = {username: 'user1', milliseconds: 1000, difficulty: 'easy'};
            const saveMock = jest.fn().mockRejectedValue(new Error('DB error'));
            Leaderboard.mockImplementation(() => ({save: saveMock}));

            await gameController.saveTime(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({error: "Errore interno nel salvataggio"}));
        });
    });

    describe('getLeaderboard', () => {
        it('restituisce i record della leaderboard', async () => {
            const records = [{username: 'user1', milliseconds: 1000, difficulty: 'easy'}];
            Leaderboard.find.mockReturnValue({sort: jest.fn().mockResolvedValue(records)});

            await gameController.getLeaderboard(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(records);
        });

        it('gestisce errori durante il recupero della leaderboard', async () => {
            Leaderboard.find.mockReturnValue({sort: jest.fn().mockRejectedValue(new Error('DB error'))});

            await gameController.getLeaderboard(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({error: "Errore nel recupero della leaderboard"});
        });
    });

    describe('newSinglePlayerGame', () => {
        it('crea una nuova partita single player e restituisce i dati', () => {
            // Mock dinamico per GameWithVite
            jest.mock('../models/GameWithVite', () => {
                return jest.fn().mockImplementation(() => {
                    const fakeSudoku = {
                        puzzle: '12-456-89'.repeat(9),
                        solution: '123456789'.repeat(9),
                        difficulty: 'medium',
                    };
                    return {sudoku: fakeSudoku, vite: 3};
                });
            });

            // Mock per la generazione dell'ID del gioco
            const originalGenerateGameId = gameController.generateGameId;
            gameController.generateGameId = jest.fn().mockReturnValue('game_test');

            // Configura i parametri della richiesta
            req.query = {difficulty: 'medium'};

            // Esegui la funzione da testare
            gameController.newSinglePlayerGame(req, res);

            // Verifica le risposte
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                gameId: 'game_test',
                puzzle: '12-456-89'.repeat(9),
                vite: 3,
            });

            // Ripristina la funzione originale
            gameController.generateGameId = originalGenerateGameId;

            // Rimuovi il mock di GameWithVite per evitare effetti collaterali
            jest.unmock('../models/GameWithVite');
        });
    });


    describe('createTeamManager and addPlayerToTeam', () => {
        let lobby, players;

        beforeEach(() => {
            lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'player1');
            players = lobbyController.getPlayersOfLobby(lobby.code);
            gameController.createTeamsClass(lobby.code, players);
        });


    });


    describe('updateStats', () => {
        it('restituisce 400 se username o result mancano', async () => {
            req.body = {username: 'user'};
            await gameController.updateStats(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('restituisce 404 se utente non trovato', async () => {
            req.body = {username: 'user1', result: 'win'};
            User.findOneAndUpdate.mockResolvedValue(null);
            await gameController.updateStats(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({error: "Utente non trovato"});
        });

        it('aggiorna le statistiche e restituisce 200 in caso di successo', async () => {
            req.body = {username: 'user1', result: 'win'};
            const updatedUser = {userName: 'user1', wins: 1, losses: 0};
            User.findOneAndUpdate.mockResolvedValue(updatedUser);
            await gameController.updateStats(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({message: "Statistiche aggiornate"});
        });

        it('gestisce errori durante l\'aggiornamento delle statistiche', async () => {
            req.body = {username: 'user1', result: 'win'};
            User.findOneAndUpdate.mockRejectedValue(new Error('DB error'));
            await gameController.updateStats(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({error: "Errore interno"});
        });
    });

    describe('insertNumberWithoutCheck', () => {
        it('chiama insertNumberWithoutCheck sul gioco e restituisce il risultato', () => {
            const fakeGame = {
                insertNumberWithoutCheck: jest.fn().mockReturnValue('newPuzzle'),
            };
            const cellData = {row: 0, col: 0, value: 5};
            const lobbyCode = 'LOBBY123';

            gameController.getGameOfLobby = jest.fn().mockReturnValue(fakeGame);

            const result = gameController.insertNumberWithoutCheck(cellData, lobbyCode);
            expect(result).toBe('newPuzzle');
            expect(fakeGame.insertNumberWithoutCheck).toHaveBeenCalledWith(0, 0, 5);
        });
    });
});