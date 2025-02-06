<template>
  <select v-model="internalValue" class="select difficulty-select">
    <option value="easy">Facile</option>
    <option value="medium">Medio</option>
    <option value="hard">Difficile</option>
  </select>
</template>

<script>
export default {
  name: 'DifficultySelector',
  props: {
    modelValue: {
      type: String,
      default: 'easy'
    }
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(newValue) {
        this.$emit('update:modelValue', newValue);
      }
    }
  }
}
</script>
