<template>
  <button class="back-button" @click="$emit('click')" :title="title">
    &#8592; Torna Indietro
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color, #007bff);
  border: 2px solid var(--primary-dark, #0056b3);
  color: white;
  font-size: 1rem;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.back-button:hover {
  background: var(--primary-dark, #0056b3);
  transform: scale(1.05);
}
</style>
