<script>
import LobbyUsers from "../components/LobbyUsers.vue";
import socket from '../plugins/socket.js';

export default {
  name: 'VersusGame',
  components: {LobbyUsers},
  data() {
    return {
      yellowTeam: [],
      blueTeam: [],
      buttonDisabled: false,
      numPlayers: 0,
      isMaster: false,
    };
  },
  computed: {
    canStart() {
      return (this.yellowTeam.length + this.blueTeam.length) === this.numPlayers;
    }
  },
  methods: {
    joinYellowTeam() {
      socket.emit("joinTeam", {
        color: "yellow",
        username: sessionStorage.getItem("username"),
        lobbyCode: sessionStorage.getItem("lobbyCode"),
      });
      this.buttonDisabled = true;
    },
    joinBlueTeam() {
      socket.emit("joinTeam", {
        color: "blue",
        username: sessionStorage.getItem("username"),
        lobbyCode: sessionStorage.getItem("lobbyCode"),
      });
      this.buttonDisabled = true;
    },
    backToLobby() {
      socket.emit("backToLobby", sessionStorage.getItem("lobbyCode"));
    },

  },
  mounted() {
    socket.emit("getPlayersOfLobby", sessionStorage.getItem("lobbyCode"))
    socket.on("playersOfLobby", (players) => {
      this.numPlayers = players.length;
    });
    socket.on("backToLobby", () => {
      this.$router.push({name: 'Lobby'});
    });

    socket.emit("isUserTheMaster",
      {
        username: sessionStorage.getItem('username'),
        code: sessionStorage.getItem("lobbyCode")
      });

    socket.on("youAreTheMaster", () => {
      this.isMaster = true;
      console.log("i am the master")
    })

    socket.on("onJoinTeam", (data) => {
      console.log("onJoinTeam", data);
      const {color, username} = data;
      switch (color) {
        case "blue":
          this.blueTeam.push(username);
          break;
        case "yellow":
          this.yellowTeam.push(username);
          break;
      }
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
    <div class="teams-container">
      <!-- Squadra Gialla -->
      <div class="team yellow-team">
        <h3>Squadra Gialla</h3>
        <ul>
          <li v-for="player in this.yellowTeam">{{ player }}</li>
        </ul>
        <button @click="joinYellowTeam" :disabled="this.buttonDisabled">Entra</button>
      </div>

      <!-- Squadra Blu -->
      <div class="team blue-team">
        <h3>Squadra Blu</h3>
        <ul>
          <li v-for="player in this.blueTeam">{{ player }}</li>
        </ul>
        <button @click="joinBlueTeam" :disabled="this.buttonDisabled">Entra</button>
      </div>
    </div>

    <LobbyUsers></LobbyUsers>
    <!-- Pulsante Start -->
    <div class="controls">
      <button v-if="this.isMaster" class="start-button" @click="startGame" :disabled="!canStart">
        Inizia la Partita
      </button>
    </div>

  </div>
</template>
<style scoped>
.game-lobby {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
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
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.start-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
