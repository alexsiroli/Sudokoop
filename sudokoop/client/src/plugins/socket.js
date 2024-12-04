import { io } from "socket.io-client";

// Crea un'istanza del client Socket.IO con disconnessione automatica disabilitata
const socket = io("http://localhost:5000", {
  reconnection: false, // Disabilita la riconnessione automatica
});

// Puoi aggiungere qui eventuali configurazioni o listener globali
socket.on("connect", () => {
  console.log("Connesso al server!");
});

socket.on("disconnect", () => {
  console.log("Disconnesso dal server!");
});

export default socket;
