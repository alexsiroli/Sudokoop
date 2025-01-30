<template>
  <!-- Viene mostrato solo se visible === true -->
  <div class="overlay-background" v-if="visible">
    <div class="overlay-container">
      <!-- Pulsante di chiusura in alto a destra -->
      <button class="overlay-close" @click="$emit('close')">
        &times;
      </button>

      <!-- Slot per il contenuto specifico (Account, Credits, ecc.) -->
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "OverlayDialog",
  props: {
    visible: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
/* Sfondo semitrasparente e centratura */
.overlay-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Contenitore del contenuto */
.overlay-container {
  background-color: var(--box-bg-color, #fff);
  color: var(--text-color, #000);
  padding: 20px;
  border-radius: 10px;
  width: 400px; /* stai usando 400px anche in Account/Credits */
  text-align: center;
  position: relative;
}

.overlay-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
