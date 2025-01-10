<template>
  <div class="centered-container">
    <div class="rounded-box home-box">
      <div class="header">
        <h1 class="title">Sudokoop</h1>
      </div>

      <!-- Colonna: Singleplayer e Multiplayer impilati verticalmente e centrati -->
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

      <!-- Riga 2: Leaderboard centrata -->
      <div class="menu-row centered">
        <div class="menu-item">
          <h2>Leaderboard</h2>
          <button @click="showLeaderboard()" class="button">Mostra Classifica</button>
        </div>
      </div>

      <!-- Footer: impostazioni e crediti fianco a fianco -->
      <div class="footer">
        <div class="footer-item">
          <button class="button">Impostazioni</button>
        </div>
        <div class="footer-item">
          <button class="button">Crediti</button>
        </div>
      </div>

      <!-- Leaderboard in overlay, se richiesto -->
      <Leaderboard
        v-if="leaderboardVisible"
        @close="leaderboardVisible = false"
      />
    </div>
  </div>
</template>

<script>
import Leaderboard from "../components/Leaderboard.vue";

export default {
  name: 'Home',
  components: { Leaderboard },
  data() {
    return {
      selectedDifficulty: 'easy',
      leaderboardVisible: false,
    };
  },
  methods: {
    playSinglePlayer() {
      this.$router.push({name: 'Game', query: {difficulty: this.selectedDifficulty}});
    },
    goToLobby() {
      this.$router.push({name: 'Lobby'});
    },
    showLeaderboard() {
      this.leaderboardVisible = true;
    }
  },
};
</script>

<style scoped>
.home-box {
  min-width: 600px;
  text-align: center;
}

/* Centratura degli elementi nel menu */
.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
  align-items: center;
}

.difficulty-select {
  margin-bottom: 10px;
}

/* Footer con le due voci affiancate e centrate */
.footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.footer-item {
  display: flex;
}
</style>
