<template>
  <div class="chat-box" v-if="lobbyCode">
    <div class="messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-item"
      >
        <strong>{{ message.author }}:</strong> {{ message.text }}
      </div>
    </div>
    <input
      v-model="newMessage"
      @keyup.enter="sendMessage"
      class="input"
      placeholder="Scrivi un messaggio..."
    />
    <button @click="sendMessage" class="button">Invia</button>
  </div>
</template>

<script>
import socket from "../plugins/socket.js";

export default {
  name: 'ChatBox',
  props: {
    lobbyCode: { type: String, required: true }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      username: ""
    };
  },
  mounted() {
    // Inizializza l'username al montaggio
    this.username = sessionStorage.getItem("username") || "AnonUser";
    console.log("[DELME] ChatBox mounted => user:", this.username, " lobbyCode prop:", this.lobbyCode);

    // Ascolta i messaggi in arrivo dal server
    socket.on("lobbyMessage", (msg) => {
      console.log("[DELME] ChatBox => 'lobbyMessage' ricevuto:", msg);
      this.messages.push(msg);
    });
  },
  unmounted() {
    socket.off("lobbyMessage");
    console.log("[DELME] ChatBox unmounted => listener 'lobbyMessage' rimosso");
  },
  methods: {
    sendMessage() {
      console.log("[DELME] ChatBox => sendMessage() chiamato. newMessage:", this.newMessage);

      if (!this.newMessage.trim()) {
        console.log("[DELME] ChatBox => messaggio vuoto, non invio.");
        return;
      }
      if (!this.lobbyCode) {
        console.warn("[DELME] ChatBox => nessun lobbyCode disponibile.");
        return;
      }

      console.log("[DELME] ChatBox => invio messaggio a lobbyCode:", this.lobbyCode);
      socket.emit("lobbyMessage", {
        lobbyCode: this.lobbyCode,
        author: this.username,
        text: this.newMessage
      });

      console.log("[DELME] ChatBox => messaggio inviato");
      this.newMessage = "";
    },
  },
};
</script>

<style scoped>
.chat-box {
  border: 1px solid #ccc;
  padding: 10px;
  width: 300px;
  background-color: var(--box-bg-color);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

.messages {
  height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 5px;
  background-color: var(--color-background-soft);
  border-radius: 5px;
}

.message-item {
  margin-bottom: 6px;
  word-wrap: break-word;
}
</style>
