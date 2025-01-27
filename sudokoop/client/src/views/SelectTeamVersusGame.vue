<script>
import LobbyUsers from "../components/LobbyUsers.vue";
import socket from '../plugins/socket.js';

export default {
  name: 'SelectTeamVersusGame',
  components: {LobbyUsers},
  data() {
    return {
      yellowTeam: [],
      blueTeam: [],
      buttonDisabled: false,
      selectedDifficulty: "easy",
      showError: false,
      errorMessage: "",
      player: [],
    };
  },
  computed: {


  },
  methods: {

    joinYellowTeam() {
      socket.emit("joinTeam", {
        lobbyCode: sessionStorage.getItem("lobbyCode"),
        color: "yellow",
        player: this.player,

      });
      //this.buttonDisabled = true;

    },
    joinBlueTeam() {
      socket.emit("joinTeam", {
        lobbyCode: sessionStorage.getItem("lobbyCode"),
        color: "blue",
        player: this.player,
      });
      //this.buttonDisabled = true;
    },
    backToLobby() {
      socket.emit("backToLobby", sessionStorage.getItem("lobbyCode"));
    },

    checkVersusGameCanStart() {
      // creo il gioco e avviso gli altri che possono andare nella schermata di gameVersus
      socket.emit("checkVersusGameCanStart",   sessionStorage.getItem('lobbyCode'));

    },
  },

  mounted() {
    socket.emit("getPlayersOfLobby", sessionStorage.getItem("lobbyCode"))
    socket.on("players" , (players) => {
      players.forEach(p => {
        if (p.username === sessionStorage.getItem('username')) {
          this.player = p;
        }
      })
    });
    socket.on("backToLobby", () => {
      this.$router.push({name: 'Lobby'});
    });



    socket.on('versusGameCanStart', (data) => {
      if (data.res) {
        if (this.player.isMaster) {
          socket.emit('createVersusGame', {
            lobbyCode: sessionStorage.getItem('lobbyCode'),
            difficulty: this.selectedDifficulty,
          });
        }
        this.$router.push({name: 'VersusGame'});
      } else {
        this.errorMessage = data.message;
      }
    })

    socket.on("onJoinTeam", (res) => {
      console.log("onJoinTeam", res);
      this.blueTeam = res.blueTeam;
      console.log("blu team " + this.blueTeam)
      this.yellowTeam = res.yellowTeam;
      console.log("yellow tea " + this.yellowTeam)
    })

  },
};
</script>
<template>
  <div class="rounded-box">
    <button
      class="back-button"
      @click="backToLobby"
      title="Torna alla lobby"
    >
      &#8592;
    </button>

    <h2>Scegli una squadra!</h2>
    <h4>Ogni squadra deve avere almeno un giocatore</h4>
    <div class="teams-container">
      <!-- Squadra Gialla -->
      <div class="team yellow-team">
        <h3>Squadra Gialla</h3>
        <ul>
          <li v-for="player in this.yellowTeam">{{ player.username }} <span v-if="player.isMaster"> (Master)</span></li>
        </ul>
        <button @click="joinYellowTeam" >Entra</button>
      </div>

      <!-- Squadra Blu -->
      <div class="team blue-team">
        <h3>Squadra Blu</h3>
        <ul>
          <li v-for="player in this.blueTeam">{{ player.username }} <span v-if="player.isMaster"> (Master)</span></li>
        </ul>
        <button @click="joinBlueTeam" >Entra</button>
      </div>
    </div>

    <LobbyUsers></LobbyUsers>
    <!-- Pulsante Start -->
    <div class="controls" v-if="this.player.isMaster">
      <label>Difficoltà:
        <select v-model="selectedDifficulty">
          <option value="easy">Facile</option>
          <option value="medium">Medio</option>
          <option value="hard">Difficile</option>
        </select>
      </label>
      <div class="error-popup">
        <p>{{ errorMessage }}</p>
      </div>
      <button class="start-button" @click="checkVersusGameCanStart">
        Inizia la Partita
      </button>
    </div>

  </div>
</template>
<style scoped>
.error-popup {
  color: #721c24;
  border-radius: 5px;
  padding: 10px 20px;
  z-index: 1000;
  font-size: 16px;
}


h3 {
  color: black;
}

li {
  color: black;
}

.teams-container {
  display: flex;
  justify-content: space-between;
  width: 80%;
  margin-bottom: 20px;
  padding-top: 20px;
}
.controls {
  display: flex;
  flex-direction: column; /* Dispone gli elementi in colonna */
  align-items: center; /* Centra gli elementi orizzontalmente */
  gap: 15px; /* Spazio tra gli elementi */
  margin-top: 20px; /* Margine superiore per separare dal resto */
}

.team {
  width: 30%;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
  text-align: center;
}

.yellow-team {
  background-color: #fffbe6;
}

.blue-team {
  background-color: #e6f2ff;
}

.team ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.team button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  border-radius: 5px;
}

.controls {
  text-align: center;
}

.start-button {
  padding: 15px 30px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.start-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
