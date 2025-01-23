const userController = require('../controllers/userController');
const User = require('../models/User');
const bcrypt = require('bcrypt');

jest.mock('../models/User');
jest.mock('bcrypt');

describe('User Controller', () => {
    let req, res;
    beforeEach(() => {
        req = {body: {}, query: {}};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('register', () => {
        it('restituisce errore se utente esiste già', async () => {
            req.body = {userName: 'testuser', password: 'password123'};
            User.findOne.mockResolvedValue({userName: 'testuser'});

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({error: 'Utente già presente. Effettua il login.'});
        });

        it('crea utente se non esiste', async () => {
            req.body = {userName: 'nuovoUtente', password: 'password123'};
            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedpassword');
            User.create.mockResolvedValue({userName: 'nuovoUtente', password: 'hashedpassword'});

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({message: 'Registrazione riuscita'});
        });

        it('gestisce errori interni in register', async () => {
            req.body = {userName: 'errorUser', password: 'pass'};
            User.findOne.mockRejectedValue(new Error('DB error'));

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}));
        });
    });

    describe('login', () => {
        it('restituisce errore se utente non trovato', async () => {
            req.body = {userName: 'nonEsistente', password: 'pass'};
            User.findOne.mockResolvedValue(null);

            await userController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({error: 'Username non trovato'});
        });

        it('restituisce errore se password errata', async () => {
            req.body = {userName: 'testuser', password: 'wrongpass'};
            const fakeUser = {userName: 'testuser', password: 'hashedpassword'};
            User.findOne.mockResolvedValue(fakeUser);
            bcrypt.compare.mockResolvedValue(false);

            await userController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({error: 'Password errata'});
        });

        it('effettua login con successo', async () => {
            req.body = {userName: 'testuser', password: 'correctpass'};
            const fakeUser = {userName: 'testuser', password: 'hashedpassword'};
            User.findOne.mockResolvedValue(fakeUser);
            bcrypt.compare.mockResolvedValue(true);

            await userController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({message: 'Login riuscito'});
        });

        it('gestisce errori interni in login', async () => {
            req.body = {userName: 'any', password: 'any'};
            User.findOne.mockRejectedValue(new Error('DB error'));

            await userController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({error: 'Errore nel login'});
        });
    });

    describe('getUserStats', () => {
        it('restituisce errore 400 se username non fornito', async () => {
            req.query = {}; // nessun username

            await userController.getUserStats(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: 'Username richiesto'});
        });

        it('restituisce errore 404 se utente non trovato', async () => {
            req.query = {username: 'nonEsistente'};
            User.findOne.mockResolvedValue(null);

            await userController.getUserStats(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({error: 'Utente non trovato'});
        });

        it('restituisce le statistiche dell\'utente', async () => {
            req.query = {username: 'utente'};
            const fakeUser = {wins: 5, losses: 2};
            User.findOne.mockResolvedValue(fakeUser);

            await userController.getUserStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({wins: 5, losses: 2});
        });

        it('gestisce errori interni in getUserStats', async () => {
            req.query = {username: 'errore'};
            User.findOne.mockRejectedValue(new Error('DB error'));

            await userController.getUserStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({error: 'Errore interno'});
        });
    });
});