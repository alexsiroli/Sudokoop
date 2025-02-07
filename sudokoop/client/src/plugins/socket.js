/**
 * @file socket.js
 * @description Configurazione e gestione della connessione WebSocket con il server.
 * Utilizza la libreria socket.io-client per stabilire una connessione bidirezionale.
 */

import { io } from 'socket.io-client';

// Inizializza la connessione WebSocket con il server remoto
const socket = io('http://54.177.155.194:5001', {
  reconnection: true, // Abilita la riconnessione automatica in caso di disconnessione
});

// Proprietà per memorizzare il nome utente associato alla connessione
socket.username = "";

// Evento che viene emesso quando la connessione al server è stabilita con successo
socket.on('connect', () => {
  console.log('Connesso al server!');
});

// Evento che viene emesso quando la connessione al server viene persa
socket.on('disconnect', () => {
  console.log('Disconnesso dal server!');
});

// Esporta il socket per essere utilizzato in altri componenti dell'applicazione
export default socket;
