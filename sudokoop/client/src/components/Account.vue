<template>
  <div class="account-overlay">
    <div class="account-container">
      <h2>Il Tuo Account</h2>
      <p><strong>Username:</strong> {{ username }}</p>
      <!-- Vittorie e Sconfitte su una singola riga -->
      <div class="stats-row">
        <p><strong>Vittorie:</strong> {{ wins }}</p>
        <p><strong>Sconfitte:</strong> {{ losses }}</p>
      </div>

      <div class="buttons-row">
        <button class="button white-button" @click="closeOverlay">Chiudi</button>
        <button class="button" @click="logout">Esci (Logout)</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "../main.js";

export default {
  name: "AccountOverlay",
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
    logout() {
      sessionStorage.removeItem('username');
      this.$router.push({name: "Login"});
    },
    closeOverlay() {
      this.$emit("close");
    }
  },
};
</script>

<style scoped>
.account-overlay {
  position: absolute;
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

.account-container {
  background-color: var(--box-bg-color);
  color: var(--text-color);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
}

.buttons-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
}

.white-button {
  background-color: #fff;
  color: #000;
  border: 2px solid #444;
}
</style>
