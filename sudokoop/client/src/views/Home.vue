<template>
  <div class="centered-container">
    <div class="rounded-box home-box">
      <div class="header">
        <h1 class="title">Sudokoop</h1>
      </div>

      <!-- Singleplayer e Multiplayer impilati verticalmente -->
      <div class="menu-column">
        <div class="menu-item">
          <h2>Singleplayer</h2>
          <select v-model="selectedDifficulty" class="select difficulty-select">
            <option value="easy">Facile</option>
            <option value="medium">Medio</option>
            <option value="hard">Difficile</option>
          </select>
          <button @click="playSinglePlayer" class="button">Inizia</button>
        </div>
        <div class="menu-item">
          <h2>Multiplayer</h2>
          <button @click="goToLobby" class="button">Crea/Entra in Lobby</button>
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

      <!-- Leaderboard in overlay, se richiesto -->
      <Leaderboard
        v-if="leaderboardVisible"
        @close="leaderboardVisible = false"
      />

      <!-- Account in overlay, se richiesto -->
      <Account
        v-if="accountVisible"
        @close="accountVisible = false"
      />

      <!-- Credits in overlay, se richiesto -->
      <Credits
        v-if="creditsVisible"
        @close="creditsVisible = false"
      />
    </div>
  </div>
</template>

<script>
import Leaderboard from "../components/Leaderboard.vue";
import Account from "../components/Account.vue";
import Credits from "../components/Credits.vue";

export default {
  name: 'Home',
  components: {Credits, Leaderboard, Account },
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
      this.$router.push({ name: 'Game', query: { difficulty: this.selectedDifficulty } });
    },
    goToLobby() {
      this.$router.push({ name: 'Lobby' });
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
  },
};
</script>

<style scoped>
.home-box {
  min-width: 600px;
  text-align: center;
}

/* Colonna per Singleplayer e Multiplayer */
.menu-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 250px;
}

.menu-row.centered {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

/* Footer */
.footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
.footer-item {
  display: flex;
}

/* Bottone bianco */
.white-button {
  background-color: #fff !important;
  color: #000 !important;
  border: 2px solid #444 !important;
}
</style>
