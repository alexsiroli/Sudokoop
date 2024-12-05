<template>
  <div>
    <h1>Benvenuto a Sudokoop!</h1>
    <router-link to="/game">Gioca in Singolo</router-link>
    <router-link to="/multiplayer">Gioca in Multiplayer</router-link>
  </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>

<style scoped>
/* Stili per la home */
</style>
