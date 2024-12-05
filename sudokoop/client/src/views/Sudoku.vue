<template>
  <div>
    <h1>Sudoku Game</h1>
    <form @submit.prevent="sendMessage">
      <label>
        Inserisci la cella e il numero (es: A1=5):
        <input v-model="message" />
      </label>
      <button type="submit">Invia</button>
    </form>
    <ul>
      <li v-for="msg in messages" :key="msg.id">{{ msg.text }}</li>
    </ul>
  </div>
</template>

<script>
import socket from "@/plugins/socket";

export default {
  data() {
    return {
      message: "", // Messaggio da inviare
      messages: [], // Elenco dei messaggi ricevuti
    };
  },
  methods: {
    sendMessage() {
      if (this.message.trim() !== "") {
        // Invia il messaggio al server
        socket.emit("insert", this.message);
        this.message = ""; // Resetta l'input
      }
    },
  },
  mounted() {
    // Ascolta i messaggi ricevuti dal server
    socket.on("message", (msg) => {
      this.messages.push({ id: Date.now(), text: msg });
    });

    socket.on("sudoku", (msg) => {
      console.log("Sudoku:", msg);
      // Puoi aggiungere la logica per gestire il messaggio relativo al Sudoku
    });
  },
  beforeUnmount() {
    // Rimuovi i listener per evitare duplicazioni
    socket.off("message");ò
    socket.off("sudoku");
  },
};
</script>

<style scoped>
form {
  margin-bottom: 1rem;
}
</style>
