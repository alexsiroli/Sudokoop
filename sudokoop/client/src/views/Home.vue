<script>
import Leaderboard from "../components/Leaderboard.vue";
import Account from "../components/Account.vue";
import Credits from "../components/Credits.vue";
import DifficultySelector from "../components/DifficultySelector.vue";
import socket from "../plugins/socket";

export default {
  name: 'Home',
  components: {Credits, Leaderboard, Account, DifficultySelector},
  data() {
    return {
      selectedDifficulty: 'easy',
      leaderboardVisible: false,
      accountVisible: false,
      creditsVisible: false
    };
  },
  methods: {
    playSinglePlayer() {
      this.$router.push({name: 'Game', query: {difficulty: this.selectedDifficulty}});
    },
    createAndGoToLobby() {
      socket.emit("createLobby", sessionStorage.getItem('username'));
      this.$router.push({name: 'Lobby'});
    },
    joinLobby() {
      this.$router.push({name: 'Lobby'});
    },
    showLeaderboard() {
      this.leaderboardVisible = true;
    },
    showAccount() {
      this.accountVisible = true;
    },
    showCredits() {
      this.creditsVisible = true;
    }
  }
};
</script>


<template>
  <div class="centered-container">
    <div class="rounded-box home-box">
      <div class="header">
        <img src="/logo.png" alt="Sudokoop Logo" class="logo">
      </div>

      <!-- Singleplayer e Multiplayer impilati verticalmente -->
      <div class="menu-column">
        <div class="menu-item">
          <h2>Singleplayer</h2>
          <!-- Utilizzo del componente DifficultySelector -->
          <DifficultySelector v-model="selectedDifficulty" />
          <button @click="playSinglePlayer" class="button">Inizia</button>
        </div>
        <div class="menu-item">
          <h2>Multiplayer</h2>
          <button @click="createAndGoToLobby" class="button">Crea Lobby</button>
          <button @click="joinLobby" class="button">Entra in Lobby</button>
        </div>
      </div>

      <!-- Leaderboard centrata -->
      <div class="menu-row centered">
        <div class="menu-item">
          <h2>Leaderboard</h2>
          <button @click="showLeaderboard" class="button">Mostra Classifica</button>
        </div>
      </div>

      <!-- Footer: Account e Crediti fianco a fianco -->
      <div class="footer">
        <div class="footer-item">
          <button class="button" @click="showAccount">Account</button>
        </div>
        <div class="footer-item">
          <button class="button white-button" @click="showCredits">Crediti</button>
        </div>
      </div>

      <!-- Overlay components -->
      <Leaderboard v-if="leaderboardVisible" @close="leaderboardVisible = false" />
      <Account v-if="accountVisible" @close="accountVisible = false" />
      <Credits v-if="creditsVisible" @close="creditsVisible = false" />
    </div>
  </div>
</template>

<style scoped>
.home-box {
  min-width: 600px;
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
}

@media (max-width: 600px) {
  .home-box {
    min-width: 100%;
    margin-bottom: 10px;
  }
}

.logo {
  width: 60%;
  max-width: 500px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.header {
  margin-bottom: 20px;
}

.menu-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 250px;
  margin-bottom: 10px;
}

.menu-row.centered {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.footer-item {
  display: flex;
}
</style>
