<template>
  <!-- Emette un evento "click" quando l'utente preme il pulsante -->
  <button class="back-button" @click="$emit('click')" :title="title">
    &#8592;
  </button>
</template>

<script>
export default {
  name: "BackButton",
  props: {
    title: {
      type: String,
      default: "Torna indietro"
    }
  }
}
</script>

<style scoped>
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
}
</style>
