<template>
  <div class="credits-overlay">
    <div class="credits-container">
      <h2>Crediti</h2>

      <!-- Testo informativo sul progetto -->
      <p>
        <strong>Sudokoop</strong> è un progetto universitario sviluppato per l’Università di Bologna.
        <br/><br/>
        <strong>Correlato ai corsi:</strong>
        <br/>
        <em>Sistemi Distribuiti</em>
        <br/>
        <em>Applicazioni e Servizi Web</em>.
      </p>
      <p>
        <strong>Sviluppato da:</strong>
        <br/>
        Alice Mastrilli (<em>alice.mastrilli@studio.unibo.it</em>)
        <br/>
        Alex Siroli (<em>alex.siroli@studio.unibo.it</em>)
      </p>

      <!-- Pulsante per chiudere l'overlay -->
      <div class="buttons-row">
        <button class="button white-button" @click="closeOverlay">Chiudi</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Credits",
  emits: ["close"],
  methods: {
    closeOverlay() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.credits-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Sfondo semitrasparente */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.credits-container {
  background-color: var(--box-bg-color);
  color: var(--text-color);
  padding: 20px;
  border-radius: 10px;
  width: 400px; /* Stessa larghezza di Account.vue */
  text-align: center;
}

.buttons-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
}

/* Bottone bianco (come in Account.vue) */
.white-button {
  background-color: #fff;
  color: #000;
  border: 2px solid #444;
}
</style>
