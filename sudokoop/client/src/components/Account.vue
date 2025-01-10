<template>
  <div class="account-overlay">
    <div class="account-container">
      <h2>Il Tuo Account</h2>
      <p><strong>Username:</strong> {{ username }}</p>
      <!-- Vittorie e Sconfitte -->
      <div class="stats-row">
        <p><strong>Vittorie:</strong> 0</p>
        <p><strong>Sconfitte:</strong> 0</p>
      </div>

      <div class="buttons-row">
        <button class="button white-button" @click="closeOverlay">Chiudi</button>
        <button class="button" @click="logout">Esci (Logout)</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AccountOverlay",
  emits: ["close"],
  data() {
    return {
      username: ""
    };
  },
  mounted() {
    // Recupera l'username da sessionStorage
    this.username = sessionStorage.getItem('username') || "AnonUser";
  },
  methods: {
    logout() {
      sessionStorage.removeItem('username');
      this.$router.push({ name: "Login" });
    },
    closeOverlay() {
      this.$emit("close");
    }
  },
};
</script>

<style scoped>
.account-overlay {
  position: absolute; /* NON fixed, così come la leaderboard */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5); /* Semi-trasparenza */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.account-container {
  background-color: white;
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

/* Bottone bianco */
.white-button {
  background-color: #fff;
  color: #000;
  border: 2px solid #444;
}
</style>
