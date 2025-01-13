<template>
  <div class="chat-box" v-if="lobbyCode">
    <div class="messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-item"
        :style="getMessageStyle(message)"
      >
        <template v-if="message.type === 'join'">
          <strong>{{ message.author }}:</strong> {{ message.text }}
        </template>
        <template v-else-if="message.type === 'leave'">
          <strong>{{ message.author }}:</strong> {{ message.text }}
        </template>
        <template v-else>
          <strong>{{ message.author }}:</strong> {{ message.text }}
        </template>
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
      username: "",
      knownPlayers: []  // Per tenere traccia dei giocatori già noti
    };
  },
  mounted() {
    this.username = sessionStorage.getItem("username") || "AnonUser";
    console.log("[DELME] ChatBox mounted => user:", this.username, " lobbyCode prop:", this.lobbyCode);

    // Gestione dei messaggi in arrivo
    socket.on("lobbyMessage", (msg) => {
      console.log("[DELME] ChatBox => 'lobbyMessage' ricevuto:", msg);
      this.messages.push({ ...msg, type: 'chat' });
    });

    // Ascolta aggiornamenti dei giocatori per generare messaggi di sistema
    socket.on("players", (playersArr) => {
      console.log("[DELME] ChatBox => 'players' evento ricevuto:", playersArr);
      // Determina chi è entrato e chi è uscito
      const newPlayers = playersArr.filter(p => !this.knownPlayers.some(k => k.username === p.username));
      const leftPlayers = this.knownPlayers.filter(k => !playersArr.some(p => p.username === k.username));

      newPlayers.forEach(p => {
        this.messages.push({
          author: "lobby",
          text: `${p.username} si è unito alla lobby`,
          type: 'join'
        });
      });

      leftPlayers.forEach(p => {
        this.messages.push({
          author: "lobby",
          text: `${p.username} ha lasciato la lobby`,
          type: 'leave'
        });
      });

      this.knownPlayers = playersArr;
    });
  },
  unmounted() {
    socket.off("lobbyMessage");
    socket.off("players");
    console.log("[DELME] ChatBox unmounted => listener rimosso");
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
    getMessageStyle(message) {
      // Imposta stili in base al tipo di messaggio di sistema
      if (message.type === 'join') {
        return { color: 'green' };
      } else if (message.type === 'leave') {
        return { color: 'red' };
      }
      return {};
    }
  }
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
