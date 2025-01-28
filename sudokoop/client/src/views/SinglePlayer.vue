<template>
  <div class="singleplayer-container">
    <h1>Single Player</h1>
    <label for="difficulty">Seleziona Difficoltà:</label>
    <select v-model="selectedDifficulty">
      <option value="easy">Facile</option>
      <option value="medium">Medio</option>
      <option value="hard">Difficile</option>
    </select>
    <button @click="startGame">Inizia Partita</button>
  </div>
</template>

<script>
export default {
  name: 'SinglePlayer',
  data() {
    return {
      selectedDifficulty: 'easy',
    };
  },
  methods: {
    startGame() {
      // Naviga a /game con il query param della difficoltà
      this.$router.push({name: 'Game', query: {difficulty: this.selectedDifficulty}});
    },
  },
};
</script>

<style scoped>
.singleplayer-container {
  text-align: center;
  margin-top: 50px;
}
</style>
