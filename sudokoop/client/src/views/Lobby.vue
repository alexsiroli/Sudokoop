<template>
  <div class="centered-container">
    <div class="rounded-box">
      <button
        class="back-button"
        @click="leaveLobbyAndGoHome"
        title="Torna alla Home (e abbandona la lobby)"
      >
        &#8592;
      </button>

      <h1>Lobby</h1>
      <div v-if="!inLobby">
        <button @click="createLobby" class="button">Crea Lobby</button>
        <div style="margin-top:20px;">
          <input v-model="lobbyCode" class="input" placeholder="Inserisci Codice Lobby"/>
          <button @click="joinLobby" class="button">Unisciti</button>
        </div>
        <p class="text-bg-danger" v-if="lobbyCodeError">{{ lobbyCodeError }}</p>
      </div>

      <div v-else>
        <p>Codice Lobby: {{ currentLobbyCode }}</p>
        <h3>Giocatori:</h3>
        <ul>
          <li v-for="p in players" :key="p.username">
            {{ p.username }} <span v-if="p.isMaster"> (Master)</span>
          </li>
        </ul>
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
          <p class="text-danger">{{ errorOnStart }}</p>
        </div>
      </div>

      <!-- ChatBox visibile solo se inLobby è true -->
      <div style="margin-top: 20px;" v-if="inLobby">
        <chat-box :lobbyCode="currentLobbyCode" />
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../plugins/socket.js";
import ChatBox from "../components/ChatBox.vue";

export default {
  name: "Lobby",
  components: { ChatBox },
  data() {
    return {
      inLobby: false,
      currentLobbyCode: "",
      players: [],
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
      const user = sessionStorage.getItem('username');
      console.log("[DELME] Lobby.vue => createLobby => user:", user);
      socket.emit("createLobby", user);
    },
    joinLobby() {
      console.log("[DELME] Lobby.vue => joinLobby => code:", this.lobbyCode);
      socket.emit("joinLobby", {
        username: sessionStorage.getItem('username'),
        code: this.lobbyCode
      });
    },
    startMultiGame() {
      console.log("[DELME] Lobby.vue => startMultiGame => code:", this.currentLobbyCode,
        " mode:", this.selectedMode, " difficulty:", this.selectedDifficulty);
      socket.emit("startMultiGame", {
        lobbyCode: this.currentLobbyCode,
        mode: this.selectedMode,
        difficulty: this.selectedDifficulty,
      });
    },
    leaveLobbyAndGoHome() {
      if (this.currentLobbyCode) {
        const username = sessionStorage.getItem("username") || "AnonUser";
        socket.emit("leaveLobby", {code: this.currentLobbyCode, username});
        socket.emit("leaveLobbyRoom", this.currentLobbyCode);
        sessionStorage.removeItem("lobbyCode");
      }
      this.$router.push({name: "Home"});
    }
  },
  mounted() {
    console.log("[DELME] Lobby.vue => mounted");
    socket.on("onLobbyCreated", (code) => {
      console.log("[DELME] onLobbyCreated => code:", code);
      sessionStorage.setItem("lobbyCode", code);
      this.currentLobbyCode = code;
      this.inLobby = true;
      this.isMaster = true;
    });
    socket.on("joinLobby", (res) => {
      console.log("[DELME] joinLobby callback =>", res);
      if (res === "Ok") {
        sessionStorage.setItem("lobbyCode", this.lobbyCode);
        this.currentLobbyCode = this.lobbyCode;
        this.inLobby = true;
        this.errorOnStart = "";
      } else if (res === "Not exists") {
        this.lobbyCodeError = "Questa lobby non esiste!";
      } else if (res === "Full") {
        this.lobbyCodeError = "Lobby piena (max 10)!";
      }
    });
    socket.on("players", (playersArr) => {
      console.log("[DELME] Lobby.vue => players =>", playersArr);
      this.players = playersArr;
      this.isMaster = playersArr.some(p =>
        p.username === sessionStorage.getItem('username') && p.isMaster);
    });
    socket.on("gameStarted", (mode) => {
      console.log("[DELME] Lobby.vue => gameStarted => mode:", mode);
      if (mode === "coop") {
        this.$router.push({name: 'CoopGame'});
      } else {
        this.$router.push({name: 'VersusGame'});
      }
    });
    socket.on("notEnoughPlayers", () => {
      console.log("[DELME] Lobby.vue => notEnoughPlayers");
      this.errorOnStart = "Non ci sono abbastanza giocatori per iniziare la partita";
    });
    socket.on("notMaster", () => {
      console.log("[DELME] Lobby.vue => notMaster => alert user");
      alert("Non sei il master, non puoi avviare la partita!");
    });
  },
  beforeUnmount() {
    socket.off("onLobbyCreated");
    socket.off("joinLobby");
    socket.off("players");
    socket.off("gameStarted");
    socket.off("notEnoughPlayers");
    socket.off("notMaster");
  },
};
</script>

<style scoped>
/* Stili locali (eventuali) */
</style>
