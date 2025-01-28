<template>
  <div class="chat-box" v-if="lobbyCode">
    <div class="messages" ref="messagesContainer">
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
    lobbyCode: {type: String, required: true}
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      username: "",
      knownPlayers: [],
      colors: [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
        '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
      ],
      userColorMap: {},       // Mappa degli utenti ai colori assegnati
      currentColorIndex: 0    // Indice per l'assegnazione sequenziale dei colori
    };
  },
  mounted() {
    this.username = sessionStorage.getItem("username") || "AnonUser";

    socket.on("lobbyMessage", (msg) => {
      this.messages.push({...msg, type: 'chat'});
      this.scrollToBottom();
    });

    socket.on("players", (playersArr) => {
      // Determina i nuovi giocatori e quelli che hanno lasciato la lobby
      const newPlayers = playersArr.filter(p => !this.knownPlayers.some(k => k.username === p.username));
      const leftPlayers = this.knownPlayers.filter(k => !playersArr.some(p => p.username === k.username));

      // Assegna colori ai nuovi giocatori in ordine
      newPlayers.forEach(p => {
        // Assegna colore solo se non già assegnato
        if (!this.userColorMap[p.username]) {
          this.userColorMap[p.username] = this.colors[this.currentColorIndex];
          this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        }
        this.messages.push({
          author: "lobby",
          text: `${p.username} si è unito alla lobby`,
          type: 'join'
        });
      });

      // Rimuove i giocatori che hanno lasciato dalla mappa colori
      leftPlayers.forEach(p => {
        delete this.userColorMap[p.username];
        this.messages.push({
          author: "lobby",
          text: `${p.username} ha lasciato la lobby`,
          type: 'leave'
        });
      });

      this.knownPlayers = playersArr;
      this.scrollToBottom();
    });
  },
  unmounted() {
    socket.off("lobbyMessage");
    socket.off("players");
  },
  methods: {
    sendMessage() {

      if (!this.newMessage.trim()) {
        return;
      }
      if (!this.lobbyCode) {
        return;
      }

      socket.emit("lobbyMessage", {
        lobbyCode: this.lobbyCode,
        author: this.username,
        text: this.newMessage
      });

      this.newMessage = "";
    },
    getMessageStyle(message) {
      if (message.type === 'join') {
        return {color: 'green'};
      } else if (message.type === 'leave') {
        return {color: 'red'};
      }
      return {color: this.getUserColor(message.author)};
    },
    getUserColor(username) {
      // Restituisce il colore assegnato all'utente dalla mappa, oppure nero se non trovato
      return this.userColorMap[username] || '#000000';
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
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
