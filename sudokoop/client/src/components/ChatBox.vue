<template>
  <!-- Template del componente Chat Box -->
  <div class="chat-box">
    <!-- Contenitore per i messaggi -->
    <div class="messages">
      <!-- Ciclo attraverso ogni messaggio e visualizza utente e testo -->
      <div v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.user }}:</strong> {{ msg.text }}
      </div>
    </div>
    <!-- Form per inviare un nuovo messaggio -->
    <form @submit.prevent="sendMessage">
      <input v-model="message" placeholder="Scrivi un messaggio..." />
      <button type="submit">Invia</button>
    </form>
  </div>
</template>

<script>
// Importa l'istanza del socket dalla cartella plugins
import socket from '../plugins/socket';

export default {
  name: 'ChatBox',
  data() {
    return {
      message: '', // Messaggio corrente digitato dall'utente
      messages: [], // Array che contiene tutti i messaggi della chat
    };
  },
  methods: {
    // Metodo per inviare un messaggio
    sendMessage() {
      if (this.message.trim() !== '') {
        const msg = {
          user: 'Anonimo', // Utente che invia il messaggio (sostituire con il nome dell'utente loggato se disponibile)
          text: this.message, // Testo del messaggio
        };
        // Emetti il messaggio al server utilizzando il socket
        socket.emit('chatMessage', msg);
        // Svuota il campo di input dopo l'invio
        this.message = '';
      }
    },
  },
  mounted() {
    // Ascolta i messaggi in arrivo dal server
    socket.on('message', (msg) => {
      this.messages.push(msg); // Aggiungi il nuovo messaggio all'array dei messaggi
    });
  },
  beforeUnmount() {
    // Rimuovi il listener del socket quando il componente viene smontato
    socket.off('message');
  },
};
</script>

<style scoped>
/* Stili per il contenitore della chat box */
.chat-box {
  border: 1px solid #ccc;
  padding: 10px;
  width: 300px;
}

/* Stili per il contenitore dei messaggi */
.messages {
  height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}
</style>
