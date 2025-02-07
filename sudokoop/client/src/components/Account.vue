/**
* @file Account.vue
* @description Componente per la visualizzazione delle informazioni dell'account utente.
* Mostra il nome utente, il numero di vittorie e sconfitte e fornisce opzioni per chiudere il pop-up o effettuare il logout.
*/

<script>
import axios from "../main.js";
import OverlayDialog from "./OverlayDialog.vue";

export default {
  name: "AccountOverlay",
  components: {
    OverlayDialog,
  },
  emits: ["close"],
  data() {
    return {
      username: "",
      wins: 0,
      losses: 0,
    };
  },
  mounted() {
    // Recupera il nome utente dal sessionStorage o imposta "AnonUser" se non è presente
    this.username = sessionStorage.getItem("username") || "AnonUser";
    this.fetchStats(); // Recupera le statistiche utente dal server
  },
  methods: {
    /**
     * Recupera le statistiche dell'utente dal server e le aggiorna nel componente.
     */
    async fetchStats() {
      try {
        const response = await axios.get(`/stats?username=${this.username}`);
        this.wins = response.data.wins || 0;
        this.losses = response.data.losses || 0;
      } catch (err) {
        console.error("Errore nel recupero delle statistiche utente:", err);
      }
    },

    /**
     * Esegue il logout dell'utente, rimuove i dati dal sessionStorage e reindirizza alla pagina di login.
     */
    async logout() {
      try {
        await axios.post("/logout", { userName: this.username });
      } catch (err) {
        console.error("Errore durante il logout:", err);
      }

      sessionStorage.removeItem("username"); // Rimuove l'username dalla sessione
      this.$router.push({ name: "Login" }); // Reindirizza alla pagina di login
    },

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
  <!-- OverlayDialog gestisce lo sfondo e il contenitore -->
  <OverlayDialog @close="closeOverlay">
    <h2>Il Tuo Account</h2>
    <p><strong>Username:</strong> {{ username }}</p>

    <!-- Sezione per visualizzare vittorie e sconfitte -->
    <div class="stats-row">
      <p><strong>Vittorie:</strong> {{ wins }}</p>
      <p><strong>Sconfitte:</strong> {{ losses }}</p>
    </div>

    <!-- Pulsanti per chiudere il popup o effettuare il logout -->
    <div class="buttons-row">
      <button class="button white-button" @click="closeOverlay">Chiudi</button>
      <button class="button" @click="logout">Logout</button>
    </div>
  </OverlayDialog>
</template>

<style scoped>
/**
 * Stile per la sezione delle statistiche, che allinea le informazioni in orizzontale.
 */
.stats-row {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
}
</style>
