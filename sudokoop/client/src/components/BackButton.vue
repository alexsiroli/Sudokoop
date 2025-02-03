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
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--primary-color);
  transition: color 0.3s;
  margin-right: 10px; /* Eventuale margine per distanziare se sta a sinistra di un titolo */
}

.back-button:hover {
  color: var(--primary-dark);
  transform: scale(1.1);
}
</style>
