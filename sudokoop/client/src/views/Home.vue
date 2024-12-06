<template>
  <div class="centered-container">
    <div class="rounded-box home-box">
      <div class="header">
        <h1 class="title">Sudokoop</h1>
      </div>
      <div class="menu">
        <div class="menu-item">
          <h2>Gioca in Singolo</h2>
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
      <div class="footer">
        <div class="footer-item">
          <button class="button">Impostazioni</button>
        </div>
        <div class="footer-item">
          <button class="button">Crediti</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      selectedDifficulty: 'easy',
    };
  },
  methods: {
    playSinglePlayer() {
      this.$router.push({ name: 'Game', query: { difficulty: this.selectedDifficulty } });
    },
    goToLobby() {
      this.$router.push({ name: 'Lobby' });
    },
  },
};
</script>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.difficulty-select {
  margin-bottom: 10px;
}
</style>
