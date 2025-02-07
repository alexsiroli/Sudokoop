/**
* @file Credits.vue
* @description Componente per visualizzare i crediti del progetto Sudokoop.
* Mostra informazioni sugli sviluppatori e i corsi correlati, all'interno di un overlay modale.
*/

<script>
import OverlayDialog from "./OverlayDialog.vue";

export default {
  name: "Credits",
  components: {
    OverlayDialog,
  },
  emits: ["close"],
  methods: {
    /**
     * Chiude l'overlay emettendo l'evento "close" al componente padre.
     */
    closeOverlay() {
      this.$emit("close");
    },
  },
};
</script>

<template>
  <OverlayDialog @close="closeOverlay">
    <h2>Crediti</h2>

    <!-- Testo informativo sul progetto -->
    <p>
      <strong>Sudokoop</strong> è un progetto universitario sviluppato per l’Università di Bologna.
      <br /><br />
      <strong>Correlato ai corsi:</strong>
      <br />
      <em>Sistemi Distribuiti</em>
      <br />
      <em>Applicazioni e Servizi Web</em>.
    </p>
    <p>
      <strong>Sviluppato da:</strong>
      <br />
      Alice Mastrilli (<em>alice.mastrilli@studio.unibo.it</em>)
      <br />
      Alex Siroli (<em>alex.siroli@studio.unibo.it</em>)
    </p>

    <!-- Pulsante per chiudere l'overlay -->
    <div class="buttons-row">
      <button class="button white-button" @click="closeOverlay">Chiudi</button>
    </div>
  </OverlayDialog>
</template>

<style scoped>
/**
 * Stile per la sezione dei crediti con layout semplice.
 */
.buttons-row {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
</style>
