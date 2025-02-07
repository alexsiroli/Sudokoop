/**
* @file BackButton.vue
* @description Componente per creare un pulsante "Torna Indietro".
* Permette di emettere un evento "click" quando premuto, facilitando la navigazione dell'utente.
*/

<script>
export default {
  name: "BackButton",
  props: {
    /**
     * Titolo del pulsante, visibile al passaggio del mouse.
     * Se non specificato, usa "Torna indietro" come valore predefinito.
     */
    title: {
      type: String,
      default: "Torna indietro",
    },
  },
};
</script>

<template>
  <!-- Pulsante che emette l'evento "click" al componente padre quando premuto -->
  <button class="back-button" @click="$emit('click')" :title="title">
    &#8592; Torna Indietro
  </button>
</template>

<style scoped>
/**
 * Stile del pulsante "Torna Indietro".
 * - Colore di sfondo e bordo definiti con variabili CSS.
 * - Transizione fluida al passaggio del mouse.
 */
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  border: 2px solid var(--primary-dark);
  color: white;
  font-size: 1rem;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.back-button:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}
</style>
