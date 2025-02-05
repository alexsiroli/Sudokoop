<script>
import LobbyUsers from "../components/LobbyUsers.vue";
import socket from '../plugins/socket.js';
import BackButton from "../components/BackButton.vue";

export default {
  name: 'SelectTeamVersusGame',
  components: { LobbyUsers, BackButton },
  data() {
    return {
      yellowTeam: [],
      blueTeam: [],
      buttonDisabled: false,
      showError: false,
      errorMessage: "",
      player: [],
      allPlayers: [],
    };
  },
  computed: {},
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
      socket.emit("checkVersusGameCanStart", sessionStorage.getItem('lobbyCode'));

    },
  },

  mounted() {
    socket.emit("getPlayersOfLobby", sessionStorage.getItem("lobbyCode"))
    socket.on("players", (players) => {
      console.log("players in lobby Select team" + players);
      this.allPlayers = players;
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
        this.$router.push({name: 'VersusGame'});
      } else {
        this.errorMessage = data.message;
      }
    })

    socket.on("onJoinTeam", (res) => {
      this.blueTeam = res.blueTeam;
      this.yellowTeam = res.yellowTeam;
    })

  },
};
</script>
<template>
  <div class="rounded-box">
    <BackButton @click="backToLobby" title="Torna alla lobby" />

    <h2>Scegli una squadra!</h2>
    <h4>Ogni squadra deve avere almeno un giocatore</h4>
    <div class="teams-container">
      <!-- Squadra Gialla -->
      <div class="team yellow-team">
        <h5>Squadra Gialla</h5>
        <ul>
          <li v-for="player in this.yellowTeam">{{ player.username }} <span v-if="player.isMaster"> (Master)</span></li>
        </ul>
        <button @click="joinYellowTeam">Entra</button>
      </div>

      <!-- Squadra Blu -->
      <div class="team blue-team">
        <h5>Squadra Blu</h5>
        <ul>
          <li v-for="player in this.blueTeam">{{ player.username }} <span v-if="player.isMaster"> (Master)</span></li>
        </ul>
        <button @click="joinBlueTeam">Entra</button>
      </div>
    </div>

    <LobbyUsers :players = "allPlayers" ></LobbyUsers>
    <!-- Pulsante Start -->
    <div class="controls" v-if="this.player.isMaster">
      <p class="text-danger">{{ errorMessage }}</p>

      <button class="start-button" @click="checkVersusGameCanStart">
        Inizia la Partita
      </button>
    </div>

  </div>
</template>

<style scoped>
.error-popup {
  color: #721c24;
  background-color: #f8d7da; /* rosato “errore” */
  border-radius: var(--border-radius);
  padding: 10px 20px;
  z-index: 1000;
  font-size: 16px;
  margin-top: 10px;
}

h5 {
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
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  text-align: center;
}
.team {
  width: 30%;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: var(--border-radius);
  text-align: center;
}

@media (max-width: 768px) {
  .teams-container {
    font-size: 1rem; /* Riduzione del font per schermi piccoli */
  }
  .team {
    width: 45%;
    padding: 5%;
  }
  .team button {

    width: 80%; /* Riduzione della larghezza del pulsante su schermi piccoli */
  }
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
  padding: 5%;
  font-size: 18px;
  cursor: pointer;
  border-radius: var(--border-radius);
  border: none;
  transition: background-color var(--transition-speed);
  background-color: var(--primary-color);
  color: #fff;
}
.team button:hover {
  background-color: var(--primary-dark);
}
.start-button {
  padding: 15px 30px;
  font-size: 18px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  background-color: var(--primary-color);
  color: #fff;
  transition: background-color var(--transition-speed);
}
.start-button:hover {
  background-color: var(--primary-dark);
}
.start-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
