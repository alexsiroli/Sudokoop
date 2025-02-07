# Sudokoop

Sudokoop è un progetto universitario scritto con **Vue 3** e **Node.js** (Express e Socket.IO) che permette di giocare a Sudoku in diverse modalità:

- **Singleplayer**: partita singola con vite limitate e cronometro.
- **Multiplayer Co-op**: partita collaborativa tra più utenti.
- **Multiplayer Versus**: artita competitiva tra due squadre (Gialla e Blu).

Include anche funzioni di login, registrazione, chat in lobby, leaderboard e statistiche utente.

## Struttura del progetto

- **client/** (cartella Vue 3):
  - `src/` con componenti e viste (`views/`)
  - `router/` con le route
  - `plugins/` con configurazione Socket.io
  - `assets/` con CSS personalizzato (main.css, base.css)
  - File di configurazione come `vite.config.js`, `babel.config.js`, ecc.
- **server/** (cartella Node/Express):
  - `controllers/`, `models/` e `routes/`
  - `server.js`: entrypoint Node
  - Test in `tests/`
- **docker-compose.yml** + **Dockerfile.client** + **Dockerfile.server** per eseguire il tutto via Docker.

## Funzionalità principali

1. **Login / Registrazione**:
   - Registrazione con memorizzazione credenziali in database MongoDB.
   - Login con password crittografata (bcrypt).
2. **Single Player**:
   - Generazione di un puzzle Sudoku (difficoltà: easy, medium, hard)
   - 3 vite massime
   - Se finisco le vite => game over
   - Se completo => vittoria
   - Timer e salvataggio del tempo in leaderboard.
3. **Multiplayer (Coop e Versus)**:
   - Sistema di Lobby, con codice casuale.
   - Chat testuale nella Lobby.
   - Assegnazione ruoli / squadre.
   - Modalità Coop con vite in comune.
   - Modalità Versus con 2 team e punteggio a chi inserisce più numeri corretti.
   - Gestione di errori e “eliminazione” (ad es. in Versus un giocatore che inserisce un numero errato viene eliminato).
4. **Leaderboard**:
   - Tempo migliore salvato su DB (millisecondi)
   - Elenco dei record, visibili dall’overlay “classifica” su frontend.
5. **Statistiche Utente**:
   - Vittorie / sconfitte memorizzate su DB.
   - Visualizzabili da overlay “Account” nel frontend.

## Modalità di utilizzo

1. ### Utilizzo su server pubblico AWS

    La modalità più semplice per provare Sudokoop è visitare direttamente:

    ```
    http://54.177.155.194:8080
    ```
    
    Il server pubblico è attivo e ti permette di:
    - Registrarti o effettuare il login
    - Giocare in singleplayer
    - Creare o unirti a una lobby multiplayer
    - Testare la chat e le diverse modalità di gioco

2. ### Esecuzione in locale (Docker)

    In alternativa, è possibile eseguire Sudokoop in locale tramite Docker. I passaggi sono:
    
    1. Clonare il repository:
       ```
       git clone https://dvcs.apice.unibo.it/pika-lab/courses/ds/projects/ds-project-mastrilli-siroli-ay2223.git
       cd ds-project-mastrilli-siroli-ay2223/sudokoop
       ```
    2. Verificare/aggiornare le configurazioni:
       - Nel progetto, il `client` e il `server` fanno riferimento di default a http://54.177.155.194:5001 (per permettere l’accesso al server pubblico).
       - Se vuoi eseguire tutto in locale, modifica:
       - In client/src/main.js, imposta:
           ```axios.defaults.baseURL = ‘http://localhost:5001/api’```
       - In client/src/plugins/socket.js, sostituisci l’URL del server Socket con:
            ```const socket = io(‘http://localhost:5001’, { … })```
    3.	Avviare Docker Compose:
       ```docker-compose up –build```
       Questo comando crea e avvia i container:
          - mongo: database MongoDB su porta 27017
          - sudokoop-server (Node/Express) su porta 5001
          - sudokoop-client (Vue) su porta 8080
	4.	Aprire il browser su:
       ```http://localhost:8080```

## Testing

- I test relativi al **server**, si eseguono con:
```bash
  cd server
  npm run test
```
Esegue test unitari e d’integrazione, controllando controllers, models e rotte.

## Stack Tecnologico

- **Vue 3** + **Vue Router** per il frontend SPA.
- **Socket.IO** per comunicazioni real-time (chat, aggiornamenti Sudoku in multiplayer).
- **Express** + **MongoDB** (Mongoose) per API REST e persistenza dati.
- **Docker** e **docker-compose** per gestire tutto in container.

Sudokoop può essere provato immediatamente visitando http://54.177.155.194 (server pubblico già avviato) oppure in locale tramite Docker o manualmente. Buon divertimento!
