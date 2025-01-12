
<script>
import socket from "../plugins/socket.js";

export default {
  data() {
    return {
      inLobby: false,
      currentLobbyCode: "",
      players: [], // array di oggetti { username, isMaster }
      isMaster: false,
      selectedMode: "coop",
      selectedDifficulty: "easy",
      lobbyCodeError: "",
      lobbyCode: "",
      errorOnStart: "",
    };
  },
  methods: {
    createLobby() {
      socket.emit("createLobby", sessionStorage.getItem('username'));
    },
    joinLobby() {
      socket.emit("joinLobby", {
        username: sessionStorage.getItem('username'),
        code: this.lobbyCode
      });
    },
    startMultiGame() {
      socket.emit("checkForStartMultiGame", {
        lobbyCode: this.currentLobbyCode,
        mode: this.selectedMode,
        username: sessionStorage.getItem('username'),
        difficulty: this.selectedDifficulty,
      });
    }
  },
  mounted() {
    socket.on("onLobbyCreated", (code) => {
      sessionStorage.setItem("lobbyCode", code);
      this.currentLobbyCode = code;
      this.inLobby = true;
      // Il creatore è sempre master, come da server
      this.isMaster = true;
    });
    socket.on("joinLobby", (res) => {
      if (res === "Ok") {
        sessionStorage.setItem("lobbyCode", this.lobbyCode);
        this.currentLobbyCode = this.lobbyCode;
        this.errorOnStart = "";
        this.inLobby = true;
      } else if (res === "Not exists") {
        this.lobbyCodeError = "Questa lobby non esiste!";
      } else if (res === "Full") {
        this.lobbyCodeError = "Lobby piena (max 10)!";
      }
    });
    // Ricevo players come array di { username, isMaster }
    socket.on("players", (playersArr) => {
      this.players = playersArr;
    });

    socket.on("gameCanStart", mode => {

      if (mode === "coop") {
        this.$router.push({ name: 'CoopGame'});
      } else {
        this.$router.push({ name: 'VersusGame' });
      }
      // solo il master crea il gioco

    });
    socket.on("notEnoughPlayers", () => {
      this.errorOnStart = "Non ci sono abbastanza giocatori per iniziare la partita"
    })
    socket.on("notMaster", () => {
      alert("Non sei il master, non puoi avviare la partita!");
    });
  },
  beforeUnmount() {
    socket.off("onLobbyCreated");
    socket.off("joinLobby");
    socket.off("players");
    socket.off("notMaster");
  },
};
</script>
<template>
  <div class="centered-container">
    <div class="rounded-box">
      <h1>Lobby</h1>
      <!-- Se non siamo in lobby, due pulsanti: create e join -->
      <div v-if="!inLobby">
        <button @click="createLobby" class="button">Crea Lobby</button>
        <div style="margin-top:20px;">
          <input v-model="lobbyCode" class="input" placeholder="Inserisci Codice Lobby" />
          <button @click="joinLobby" class="button">Unisciti</button>
        </div>
        <p class="text-bg-danger" v-if="lobbyCodeError">{{ lobbyCodeError }}</p>
      </div>
      <!-- Se inLobby -->
      <div v-else>
        <p>Codice Lobby: {{ currentLobbyCode }}</p>
        <h3>Giocatori:</h3>
        <ul>
          <li v-for="p in players" :key="p.username">
            {{ p.username }} <span v-if="p.isMaster"> (Master)</span>
          </li>
        </ul>
        <!-- Bottone avvio, se isMaster -->
        <div v-if="isMaster">
          <label>Modalità:</label>
          <select v-model="selectedMode">
            <option value="coop">Coop</option>
            <option value="versus">Versus</option>
          </select>
          <div v-if="selectedMode==='coop'">
            <label>Difficoltà:</label>
            <select v-model="selectedDifficulty">
              <option value="easy">Facile</option>
              <option value="medium">Medio</option>
              <option value="hard">Difficile</option>
            </select>
          </div>
          <button @click="startMultiGame">Avvia Partita</button>
          <p class="text-danger" > {{this.errorOnStart}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Stili locali */
</style>
