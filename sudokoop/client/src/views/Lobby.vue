<script>
import socket from "../plugins/socket.js";
import ChatBox from "../components/ChatBox.vue";

export default {
  name: "Lobby",
  components: {ChatBox},
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
      socket.emit("checkMultiGameStart", {
        lobbyCode: this.currentLobbyCode,
        mode: this.selectedMode,
      });
    },

    leaveLobbyAndGoHome() {
      const username = sessionStorage.getItem('username');
      const lobbyCode = this.currentLobbyCode;
      // Se l'utente è attualmente in lobby, invia l'evento di abbandono al server
      if (this.inLobby && lobbyCode && username) {
        socket.emit("leaveLobby", {code: lobbyCode, username: username});
      }
      sessionStorage.removeItem("lobbyCode");
      this.$router.push({name: 'Home'});
    },

    copyLobbyCode() {
      navigator.clipboard.writeText(this.currentLobbyCode)
        .then(() => console.log("Codice lobby copiato!"))
        .catch(err => console.error("Errore nella copia:", err));
    }
  },

  mounted() {
    socket.on("onLobbyCreated", (code) => {
      sessionStorage.setItem("lobbyCode", code);
      this.currentLobbyCode = code;
      this.inLobby = true;
      this.isMaster = true;
    });

    socket.on("joinLobby", (res) => {
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
      this.players = playersArr;
      this.inLobby = true;
      this.currentLobbyCode = sessionStorage.getItem("lobbyCode");
      this.isMaster = playersArr.some(p =>
        p.username === sessionStorage.getItem('username') && p.isMaster);
    });

    socket.on('gameCanStart', (data) => {
      if (data.res) {
        if (this.selectedMode === "coop") {
          if (this.isMaster) {
            socket.emit("createCoopGame", {
              lobbyCode: this.currentLobbyCode,
              difficulty: this.selectedDifficulty});
          }
          this.$router.push({name: 'CoopGame'});
        } else {
          this.$router.push({name: 'SelectTeamVersusGame'});
        }
      } else {
        this.errorOnStart = data.message;
      }
    })

  },
  beforeUnmount() {
    socket.off("onLobbyCreated");
    socket.off("joinLobby");
    socket.off("players");
    socket.off("gameCanStart");

  }
};
</script>
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
        <p>
          Codice Lobby:
          <strong>{{ currentLobbyCode }}</strong>
          <button class="copy-button" @click="copyLobbyCode">Copia</button>
        </p>
        <h3>Giocatori:</h3>
        <ul>
          <li v-for="p in players" :key="p.username">
            {{ p.username }} <span v-if="p.isMaster"> (Master)</span>
          </li>
        </ul>

        <!-- ChatBox visibile solo se inLobby è true -->
        <div style="margin-top: 20px;" v-if="inLobby">
          <chat-box :lobbyCode="currentLobbyCode"/>
        </div>

        <!-- Sezione Master spostata sotto la ChatBox -->
        <div v-if="isMaster" class="master-panel">
          <div class="options">
            <label>Modalità:
              <select v-model="selectedMode">
                <option value="coop">Coop</option>
                <option value="versus">Versus</option>
              </select>
            </label>
            <div v-if="selectedMode==='coop'">
              <label>Difficoltà:
                <select v-model="selectedDifficulty">
                  <option value="easy">Facile</option>
                  <option value="medium">Medio</option>
                  <option value="hard">Difficile</option>
                </select>
              </label>
            </div>
          </div>
          <button
            @click="startMultiGame"
            class="button">Avvia Partita
          </button>
          <p class="text-danger">{{ errorOnStart }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Stili per la sezione master */
.master-panel {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: var(--box-bg-color);
  width: 300px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.options label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}

.options select {
  margin-top: 5px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.copy-button {
  margin-left: 10px;
  padding: 5px;
  font-size: 0.8em;
}
</style>
