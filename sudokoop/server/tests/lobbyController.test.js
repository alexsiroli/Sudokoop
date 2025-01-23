const LobbyController = require('../controllers/lobbyController');

describe('LobbyController', () => {
    let lobbyController;
    beforeEach(() => {
        lobbyController = new LobbyController();
    });

    describe('generateLobbyCode', () => {
        it('dovrebbe generare un codice di 6 caratteri in maiuscolo', () => {
            const code = lobbyController.generateLobbyCode();
            expect(code).toHaveLength(6);
            expect(code).toBe(code.toUpperCase());
        });
    });

    describe('createLobby', () => {
        it('dovrebbe creare una lobby con un master', () => {
            const masterUsername = 'masterUser';
            const lobby = lobbyController.createLobby(masterUsername);
            expect(lobby).toBeDefined();
            expect(lobby.code).toHaveLength(6);
            expect(lobbyController.getPlayersOfLobby(lobby.code)).toContainEqual({
                username: masterUsername,
                isMaster: true
            });
            expect(lobbyController.lobbies).toContain(lobby);
        });
    });

    describe('findLobby', () => {
        it('dovrebbe trovare una lobby esistente', () => {
            const masterUsername = 'masterUser';
            const newLobby = lobbyController.createLobby(masterUsername);
            const foundLobby = lobbyController.findLobby(newLobby.code);
            expect(foundLobby).toEqual(newLobby);
        });

        it('restituisce undefined se la lobby non esiste', () => {
            const foundLobby = lobbyController.findLobby('NONEXIST');
            expect(foundLobby).toBeUndefined();
        });
    });

    describe('joinLobby', () => {
        it('dovrebbe restituire not-exist se la lobby non esiste', () => {
            const result = lobbyController.joinLobby('INVALID', 'user1');
            expect(result).toEqual({success: false, reason: 'not-exist'});
        });

        it('dovrebbe aggiungere un utente a una lobby esistente', () => {
            const lobby = lobbyController.createLobby('masterUser');
            const result = lobbyController.joinLobby(lobby.code, 'user1');
            expect(result).toEqual({success: true});
            expect(lobbyController.getPlayersOfLobby(lobby.code)).toContainEqual({username: 'user1', isMaster: false});
        });

        it('non aggiunge duplicati se l\'utente è già presente', () => {
            const lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'user1');
            const result = lobbyController.joinLobby(lobby.code, 'user1');
            expect(result).toEqual({success: true});
            const occurrences = lobbyController.getPlayersOfLobby(lobby.code).filter(p => p.username === 'user1').length;
            expect(occurrences).toBe(1);
        });

        it('restituisce full se la lobby ha 10 giocatori', () => {
            const lobby = lobbyController.createLobby('masterUser');
            // Aggiungi 9 giocatori extra per raggiungere il limite
            for (let i = 1; i < 10; i++) {
                lobbyController.joinLobby(lobby.code, `user${i}`);
            }
            const result = lobbyController.joinLobby(lobby.code, 'user10');
            expect(result).toEqual({success: false, reason: 'full'});
        });
    });

    describe('removePlayer', () => {
        it('rimuove un giocatore da una lobby', () => {
            const lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'user1');
            expect(lobbyController.getPlayersOfLobby(lobby.code).length).toBe(2);
            lobbyController.removePlayerFromLobby(lobby.code, 'user1');
            expect(lobbyController.getPlayersOfLobby(lobby.code).length).toBe(1);
            expect(lobbyController.getPlayersOfLobby(lobby.code)[0].username).toBe('masterUser');
        });

        it('rimuove la lobby se l\'ultimo giocatore lascia', () => {
            const lobby = lobbyController.createLobby('masterUser');
            expect(lobbyController.lobbies).toContain(lobby);
            lobbyController.removePlayerFromLobby(lobby.code, 'masterUser');
            expect(lobbyController.findLobby(lobby.code)).toBeUndefined();
        });

        it('assegna un nuovo master se il master lascia e ci sono altri giocatori', () => {
            const lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'user1');
            lobbyController.joinLobby(lobby.code, 'user2');
            // Rimuovi il master
            lobbyController.removePlayerFromLobby(lobby.code, 'masterUser');
            // Verifica che uno dei giocatori sia stato assegnato come master
            const masterPresente = lobbyController.getPlayersOfLobby(lobby.code).some(p => p.isMaster);
            expect(masterPresente).toBe(true);
        });
    });

    describe('getPlayersOfLobby', () => {
        it('restituisce lista vuota se lobby non esiste', () => {
            const players = lobbyController.getPlayersOfLobby('NONEXIST');
            expect(players).toEqual([]);
        });

        it('restituisce la lista dei giocatori di una lobby esistente', () => {
            const lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'user1');
            const players = lobbyController.getPlayersOfLobby(lobby.code);
            expect(players).toContainEqual({username: 'masterUser', isMaster: true});
            expect(players).toContainEqual({username: 'user1', isMaster: false});
        });
    });

    describe('isMaster', () => {
        it('restituisce false se la lobby non esiste', () => {
            expect(lobbyController.isMaster('INVALID', 'user')).toBe(false);
        });

        it('restituisce true se l\'utente è master', () => {
            const lobby = lobbyController.createLobby('masterUser');
            expect(lobbyController.isMaster(lobby.code, 'masterUser')).toBe(true);
        });

        it('restituisce false se l\'utente non è master', () => {
            const lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'user1');
            expect(lobbyController.isMaster(lobby.code, 'user1')).toBe(false);
        });
    });

    describe('handleDisconnect', () => {
        it('rimuove il giocatore da una lobby', () => {
            const lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'user1');
            lobbyController.removePlayerFromLobby(lobby.code, 'user1');
            expect(lobbyController.getPlayersOfLobby(lobby.code).some(p => p.username === 'user1')).toBe(false);
        });

        it('rimuove la lobby se l\'ultimo giocatore si disconnette', () => {
            const lobby = lobbyController.createLobby('masterUser');
            lobbyController.removePlayerFromLobby(lobby.code, 'masterUser');
            expect(lobbyController.findLobby(lobby.code)).toBeUndefined();
        });

        it('assegna nuovo master se il master si disconnette e ci sono altri giocatori', () => {
            const lobby = lobbyController.createLobby('masterUser');
            lobbyController.joinLobby(lobby.code, 'user1');
            lobbyController.joinLobby(lobby.code, 'user2');
            lobbyController.removePlayerFromLobby(lobby.code, 'masterUser');
            const masterPresente = lobbyController.getPlayersOfLobby(lobby.code).some(p => p.isMaster);
            expect(masterPresente).toBe(true);
        });
    });

    describe('removeLobby', () => {
        it('rimuove una lobby esistente', () => {
            const lobby = lobbyController.createLobby('masterUser');
            expect(lobbyController.lobbies).toContain(lobby);
            lobbyController.removeLobby(lobby.code);
            expect(lobbyController.findLobby(lobby.code)).toBeUndefined();
        });
    });
});