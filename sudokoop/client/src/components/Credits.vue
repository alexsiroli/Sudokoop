<template>
  <OverlayDialog @close="closeOverlay">
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
  </OverlayDialog>
</template>

<script>
import OverlayDialog from './OverlayDialog.vue'

export default {
  name: "Credits",
  components: {
    OverlayDialog
  },
  emits: ["close"],
  methods: {
    closeOverlay() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>

.buttons-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
}

/* Bottone bianco (come in Account) */
.white-button {
  background-color: #fff;
  color: #000;
  border: 2px solid #444;
}
</style>
