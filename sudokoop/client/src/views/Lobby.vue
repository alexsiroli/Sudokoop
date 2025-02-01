<script>
import socket from "../plugins/socket.js";
import ChatBox from "../components/ChatBox.vue";
import BackButton from "../components/BackButton.vue";

export default {
  name: "Lobby",
  components: { ChatBox, BackButton },
  data() {
    return {
      inLobby: false,
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

    // chiamata solo dal master
    startMultiGame() {
      socket.emit("checkMultiGameStart", {
        lobbyCode: this.lobbyCode,
        mode: this.selectedMode,
        difficulty: this.selectedDifficulty
      });
    },

    leaveLobbyAndGoHome() {
      const username = sessionStorage.getItem('username');
      const lobbyCode = this.lobbyCode;
      // Se l'utente è attualmente in lobby, invia l'evento di abbandono al server
      if (this.inLobby && lobbyCode && username) {
        socket.emit("leaveLobby", {code: lobbyCode, username: username});
      }
      this.inLobby = false;
      this.lobbyCode = "";
      sessionStorage.removeItem("lobbyCode");
      this.$router.push({name: 'Home'});
    },

    copyLobbyCode() {
      navigator.clipboard.writeText(this.lobbyCode)
        .then(() => console.log("Codice lobby copiato!"))
        .catch(err => console.error("Errore nella copia:", err));
    }
  },

  mounted() {
    console.log("sono in lobby ", sessionStorage.getItem("lobbyCode"));
    socket.on("onLobbyCreated", (code) => {
      sessionStorage.setItem("lobbyCode", code);
      this.lobbyCode = code;
      this.inLobby = true;
      this.isMaster = true;
    });

    socket.on("joinLobby", (res) => {
      if (res.res === "Ok") {
        sessionStorage.setItem("lobbyCode", res.lobbyCode);
        this.lobbyCode = res.lobbyCode;
        this.inLobby = true;
        this.errorOnStart = "";
      } else if (res === "Not exists") {
        this.lobbyCodeError = "Questa lobby non esiste!";
      } else if (res === "Full") {
        this.lobbyCodeError = "Lobby piena (max 10)!";
      }
    });

    socket.on('goInTeamSelection', () => {
      this.$router.push({name: 'SelectTeamVersusGame'});
    });

    socket.on("players", (playersArr) => {
      console.log("players in lobby"  + playersArr);
      this.players = playersArr;
      this.inLobby = sessionStorage.getItem('lobbyCode') !== null;
      if (playersArr.length > 0 && this.inLobby) {
        this.lobbyCode = sessionStorage.getItem("lobbyCode");
        this.isMaster = playersArr.some(p =>
          p.username === sessionStorage.getItem('username') && p.isMaster);
      }
    });


    socket.on('gameCanStart', (data) => {
      if (data.res.res ) {
        if (data.mode === "coop") {
          this.$router.push({name: 'CoopGame'});
        } else {
          this.$router.push({name: 'SelectTeamVersusGame'});
        }
      } else {
        socket.emit("getPlayersOfLobby", sessionStorage.getItem('lobbyCode'))
        this.errorOnStart = data.res.message;
      }
    });

    // chiamata alla fine di una partita versus
    socket.on('versusGameCanStart', (data) => {
      if (data.res) {
        this.$router.push({name: 'VersusGame'});
      } else {
        socket.emit("getPlayersOfLobby", sessionStorage.getItem('lobbyCode'))
        this.errorOnStart = data.message;
      }
    })

  },
  beforeUnmount() {
    socket.off("onLobbyCreated");
    socket.off("joinLobby");
    socket.off("players");
    socket.off("gameCanStart");
    socket.off("versusGameCanStart");

  }
};
</script>
<template>
  <div class="centered-container">
    <div class="rounded-box">
      <BackButton
         @click="leaveLobbyAndGoHome"
         title="Torna alla Home (e abbandona la lobby)"
      />

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
          <strong>{{ this.lobbyCode }}</strong>
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
          <chat-box :lobbyCode="this.lobbyCode"/>
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
.master-panel {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: var(--border-radius);
  background-color: var(--box-bg-color);
  width: 300px;
  box-shadow: 0 1px 4px var(--shadow-color);
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
  border-radius: var(--border-radius);
}

.copy-button {
  margin-left: 10px;
  padding: 5px;
  font-size: 0.8em;
  border-radius: var(--border-radius);
}
</style>
