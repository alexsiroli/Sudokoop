/**
* @file DifficultySelector.vue
* @description Componente per la selezione della difficoltà di gioco.
*/

<script>
export default {
  name: "DifficultySelector",
  props: {
    /**
     * Valore della difficoltà attuale.
     */
    modelValue: {
      type: String,
      default: "easy",
    },
  },
  computed: {
    /**
     * Gestisce il valore interno della select.
     * - `get()`: restituisce il valore passato dal padre.
     * - `set()`: emette un evento per aggiornare il valore nel componente padre.
     */
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(newValue) {
        this.$emit("update:modelValue", newValue);
      },
    },
  },
};
</script>

<template>
  <!-- Select per scegliere la difficoltà del gioco -->
  <select v-model="internalValue" class="select difficulty-select">
    <option value="easy">Facile</option>
    <option value="medium">Medio</option>
    <option value="hard">Difficile</option>
  </select>
</template>

<style scoped>
/**
 * Stile del selettore di difficoltà.
 */
.select {
  padding: 5px;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}
</style>
