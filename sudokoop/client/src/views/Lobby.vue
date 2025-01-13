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
    }
  },
  mounted() {
    console.log("[DELME] Lobby.vue => mounted");

    // Lobby creata
    socket.on("onLobbyCreated", (code) => {
      console.log("[DELME] Lobby.vue => onLobbyCreated => code:", code);
      sessionStorage.setItem("lobbyCode", code);
      this.currentLobbyCode = code;
      this.inLobby = true;
      // Il creatore è master
      this.isMaster = true;
    });

    // Join lobby callback
    socket.on("joinLobby", (res) => {
      console.log("[DELME] Lobby.vue => joinLobby callback =>", res);
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

    // Ricevo players
    socket.on("players", (playersArr) => {
      console.log("[DELME] Lobby.vue => players =>", playersArr);
      this.players = playersArr;
      // Se l'utente che sta visualizzando è il master
      // (puoi ricontrollare setMaster altrove)
      this.isMaster = playersArr.some(p => p.username === sessionStorage.getItem('username') && p.isMaster);
    });

    socket.on("gameStarted", mode => {
      console.log("[DELME] Lobby.vue => gameStarted => mode:", mode);
      if (mode === "coop") {
        this.$router.push({name: 'CoopGame'});
      } else {
        this.$router.push({name: 'VersusGame'});
      }
    });

    // Se non abbastanza player
    socket.on("notEnoughPlayers", () => {
      console.log("[DELME] Lobby.vue => notEnoughPlayers");
      this.errorOnStart = "Non ci sono abbastanza giocatori per iniziare la partita";
    });

    // Se l'utente non è master
    socket.on("notMaster", () => {
      console.log("[DELME] Lobby.vue => notMaster => alert user");
      alert("Non sei il master, non puoi avviare la partita!");
    });
  },
  beforeUnmount() {
    console.log("[DELME] Lobby.vue => beforeUnmount => rimuovo listeners");
    socket.off("onLobbyCreated");
    socket.off("joinLobby");
    socket.off("players");
    socket.off("gameStarted");
    socket.off("notEnoughPlayers");
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
          <input v-model="lobbyCode" class="input" placeholder="Inserisci Codice Lobby"/>
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
          <p class="text-danger">{{ errorOnStart }}</p>
        </div>
      </div>

      <!-- ChatBox sempre presente nella Lobby -->
      <div style="margin-top: 20px;">
        <chat-box/>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Stili locali (facoltativi) */
</style>
