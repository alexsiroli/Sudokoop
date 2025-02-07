/**
* @file ChatBox.vue
* @description Componente per la gestione della chat in una lobby di gioco.
* Permette agli utenti di inviare messaggi e ricevere informazioni sui giocatori che si uniscono o lasciano la lobby.
*/

<script>
import socket from "../plugins/socket.js";

export default {
  name: "ChatBox",
  props: {
    /**
     * Codice univoco della lobby a cui è collegata la chat.
     */
    lobbyCode: { type: String, required: true },
  },
  data() {
    return {
      messages: [], // Array dei messaggi della chat
      newMessage: "", // Messaggio attuale dell'utente
      username: "", // Nome utente recuperato dalla sessione
      knownPlayers: [], // Lista dei giocatori conosciuti
      colors: [
        "#e60000", "#008000", "#ffcc00", "#0033cc", "#ff6600",
        "#800080", "#00cccc", "#cc00cc", "#99cc00", "#ff9999"
      ],
      userColorMap: {}, // Mappa che associa ogni utente a un colore
      currentColorIndex: 0 // Indice per l'assegnazione dei colori
    };
  },
  mounted() {
    this.username = sessionStorage.getItem("username") || "AnonUser";

    // Ascolta i messaggi della chat
    socket.on("lobbyMessage", (msg) => {
      this.messages.push({ ...msg, type: "chat" });
      this.scrollToBottom();
    });

    // Ascolta i cambiamenti nei giocatori della lobby
    socket.on("players", (playersArr) => {
      const newPlayers = playersArr.filter(p => !this.knownPlayers.some(k => k.username === p.username));
      const leftPlayers = this.knownPlayers.filter(k => !playersArr.some(p => p.username === k.username));

      // Assegna colori ai nuovi giocatori
      newPlayers.forEach(p => {
        if (!this.userColorMap[p.username]) {
          this.userColorMap[p.username] = this.colors[this.currentColorIndex];
          this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        }
        this.messages.push({ author: "lobby", text: `${p.username} si è unito alla lobby`, type: "join" });
      });

      // Rimuove i giocatori che hanno lasciato la lobby
      leftPlayers.forEach(p => {
        delete this.userColorMap[p.username];
        this.messages.push({ author: "lobby", text: `${p.username} ha lasciato la lobby`, type: "leave" });
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
    /**
     * Invia un messaggio alla lobby.
     */
    sendMessage() {
      if (!this.newMessage.trim() || !this.lobbyCode) return;
      socket.emit("lobbyMessage", { lobbyCode: this.lobbyCode, author: this.username, text: this.newMessage });
      this.newMessage = "";
    },
    /**
     * Restituisce lo stile del messaggio in base al tipo.
     */
    getMessageStyle(message) {
      if (message.type === "join") return { color: "green" };
      if (message.type === "leave") return { color: "red" };
      return { color: this.getUserColor(message.author) };
    },
    /**
     * Restituisce il colore assegnato a un utente.
     */
    getUserColor(username) {
      return this.userColorMap[username] || "#000000";
    },
    /**
     * Scorre automaticamente la chat fino all'ultimo messaggio.
     */
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    }
  }
};
</script>

<template>
  <!-- Contenitore principale della chat -->
  <div class="chat-box" v-if="lobbyCode">
    <!-- Contenitore dei messaggi -->
    <div class="messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" class="message-item" :style="getMessageStyle(message)">
        <strong>{{ message.author }}:</strong> {{ message.text }}
      </div>
    </div>
    <!-- Input per scrivere un messaggio -->
    <input v-model="newMessage" @keyup.enter="sendMessage" class="input" placeholder="Scrivi un messaggio..." />
    <button @click="sendMessage" class="button">Invia</button>
  </div>
</template>

<style scoped>
/**
 * Stile generale del box chat.
 */
.chat-box {
  border: 1px solid #ccc;
  border-radius: var(--border-radius);
  padding: 10px;
  width: 300px;
  background-color: var(--box-bg-color);
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px var(--shadow-color);
}

/**
 * Contenitore dei messaggi con scrollbar.
 */
.messages {
  height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 5px;
  background-color: var(--color-background-soft);
  border-radius: var(--border-radius);
  box-shadow: inset 0 1px 3px var(--shadow-color);
}

/**
 * Stile del singolo messaggio.
 */
.message-item {
  margin-bottom: 6px;
  word-wrap: break-word;
}
</style>
