<template>
  <!-- OverlayDialog gestisce lo sfondo e il contenitore -->
  <OverlayDialog @close="closeOverlay">
    <h2>Il Tuo Account</h2>
    <p><strong>Username:</strong> {{ username }}</p>

    <!-- Vittorie e Sconfitte su una singola riga -->
    <div class="stats-row">
      <p><strong>Vittorie:</strong> {{ wins }}</p>
      <p><strong>Sconfitte:</strong> {{ losses }}</p>
    </div>

    <div class="buttons-row">
      <button class="button white-button" @click="closeOverlay">Chiudi</button>
      <button class="button" @click="logout">Logout</button>
    </div>
  </OverlayDialog>
</template>

<script>
import axios from "../main.js";
import OverlayDialog from './OverlayDialog.vue'

export default {
  name: "AccountOverlay",
  components: {
    OverlayDialog
  },
  emits: ["close"],
  data() {
    return {
      username: "",
      wins: 0,
      losses: 0
    };
  },
  mounted() {
    this.username = sessionStorage.getItem('username') || "AnonUser";
    this.fetchStats(); // Recupera le statistiche dal server
  },
  methods: {
    async fetchStats() {
      try {
        const response = await axios.get(`/stats?username=${this.username}`);
        this.wins = response.data.wins || 0;
        this.losses = response.data.losses || 0;
      } catch (err) {
        console.error("Errore nel recupero delle statistiche utente:", err);
      }
    },
    async logout() {
      try {
        await axios.post('/logout', {userName: this.username});
      } catch (err) {
        console.error("Errore durante il logout:", err);
      }
      // Rimuovi dal sessionStorage e vai al login
      sessionStorage.removeItem('username');
      this.$router.push({name: "Login"});
    },
    closeOverlay() {
      // emette l'evento "close" al padre
      this.$emit("close");
    }
  },
};
</script>

<style scoped>
.stats-row {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
}
</style>
