# Sudokoop

Sudokoop è un progetto universitario scritto con **Vue 3** e **Node.js** (Express e Socket.IO) che permette di giocare a Sudoku in diverse modalità:

- **Singleplayer**: partita singola con vite limitate e cronometro.
- **Multiplayer Co-op**: partita collaborativa di squadra.
- **Multiplayer Versus**: sfida tra due squadre.

Include anche funzioni di login, registrazione, chat in lobby, leaderboard, statistiche utente e molto altro.

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

## Requisiti

- **Docker** e **docker-compose** installati.
- Nessuna installazione separata di Node.js / MongoDB necessaria (il docker-compose si occuperà di tutto).

## Istruzioni di esecuzione su nuova macchina

1. Clonare questo repository:

```bash
git clonehttps://dvcs.apice.unibo.it/pika-lab/courses/ds/projects/ds-project-mastrilli-siroli-ay2223.git
cd ds-project-mastrilli-siroli-ay2223
```

2. Verificare i file di configurazione:
   - `docker-compose.yml` definisce i servizi (client, server, mongo)
   - `Dockerfile.client` e `Dockerfile.server` per buildare le rispettive immagini Docker.

3. Avviare Docker Compose:

```bash
docker-compose up --build
```

4. Attendere che i container si avviino:
   - `sudokoop-server` in ascolto su porta `5001`
   - `sudokoop-client` in ascolto su porta `8080`
   - `sudoku-mongo` come database

5. Aprire il browser all’indirizzo:

```
http://localhost:8080
```

6. Interagire con l’app:
   - Registrarsi o fare login
   - Scegliere Singleplayer o Lobby (multiplayer)
   - Avviare partite, chattare, ecc.

## Testing

- I test relativi al **server**, si eseguono con:
```bash
  cd server
  npm run test
```

## Stack Tecnologico

- **Vue 3** + **Vue Router** per il frontend SPA.
- **Socket.IO** per comunicazioni real-time (chat, aggiornamenti Sudoku in multiplayer).
- **Express** + **MongoDB** (Mongoose) per il backend.
- **Docker** e **docker-compose** per gestire tutto in container.

Buon divertimento con Sudokoop!
