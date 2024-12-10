<script>
import CreateLobby from "./CreateLobby.vue";
export default {
  name: 'Lobby',
  data() {
    return {
      inLobby: false,
      isMaster: false,
      lobbyCode: '',
      currentLobbyCode: '',
      players: [],
      selectedMode: 'coop',
      selectedDifficulty: 'easy',
      showLobbyForm: false,
    };
  },
  components: {
    CreateLobby
  },
  methods: {
    createLobby() {
      this.showLobbyForm = true;

      // Logica per creare una lobby
    },
    onLobbyCreated(lobbyName) {
      console.log("Created" + lobbyName)
      this.showLobbyForm = false;
      this.inLobby = true;
      this.currentLobbyCode = lobbyName;


    },
    joinLobby() {
      // Logica per unirsi a una lobby
    },
    startMultiplayerGame() {
      if (this.selectedMode === 'coop') {
        this.$router.push({ name: 'CoopGame', query: { difficulty: this.selectedDifficulty } });
      } else {
        this.$router.push({ name: 'VersusGame' });
      }
    },
    goBack() {
      this.$router.push('/');
    }
  },
};
</script>
<template>
  <div class="centered-container">
    <div class="rounded-box lobby-container">
      <button class="back-button" @click="goBack" title="Torna Indietro">&#8592;</button>
      <h1 class="title">Lobby</h1>
      <CreateLobby v-show="showLobbyForm" :onLobbyCreated = "this.onLobbyCreated"></CreateLobby>
      <div v-show="!showLobbyForm">
      <div v-if="!inLobby">
        <h2 class="subtitle">Crea o Unisciti a una Lobby</h2>
        <div class="create-lobby">
          <button @click="createLobby" class="button">Crea Lobby</button>
        </div>
        <div class="join-lobby" style="margin-top:20px;">
          <input v-model="lobbyCode" placeholder="Inserisci codice lobby" class="input" />
          <button @click="joinLobby" class="button" style="margin-top:10px;">Unisciti</button>
        </div>
      </div>
      <div v-else>
        <p class="lobby-code">Codice Lobby: {{ currentLobbyCode }}</p>
        <div class="players-list">
          <h3>Giocatori:</h3>
          <ul>
            <li v-for="player in players" :key="player.id" class="player-item">
              {{ player.username }}
            </li>
          </ul>
        </div>
        </div>
        <div v-if="isMaster" class="game-settings">
          <h3 class="subtitle">Impostazioni Partita</h3>
          <div class="select-mode" style="margin-bottom:10px;">
            <label>Modalità:</label>
            <select v-model="selectedMode" class="select">
              <option value="coop">Coop</option>
              <option value="versus">Versus</option>
            </select>
          </div>
          <div v-if="selectedMode === 'coop'" class="select-difficulty" style="margin-bottom:10px;">
            <label>Difficoltà:</label>
            <select v-model="selectedDifficulty" class="select">
              <option value="easy">Facile</option>
              <option value="medium">Medio</option>
              <option value="hard">Difficile</option>
            </select>
          </div>
          <div class="start-game" style="margin-top:20px;">
            <button @click="startMultiplayerGame" class="button">Avvia Partita</button>
          </div>
        </div>
    </div>
    </div>
  </div>
</template>
<style scoped>
.player-item {
  padding: 5px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
</style>
