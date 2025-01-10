<template>
  <div class="centered-container">
    <div class="rounded-box">
      <h2>Login</h2>

      <!-- Se già loggato, mostra un messaggio con countdown -->
      <p v-if="alreadyLogged">
        Sei già loggato come <strong>{{ storedUsername }}</strong>!<br /><br />
        Verrai reindirizzato tra {{ countdown }}...
      </p>

      <!-- Altrimenti mostra form di login + link registrazione -->
      <template v-else>
        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <input
              type="text"
              v-model="username"
              placeholder="Username"
              required
            />
          </div>
          <div class="mb-3">
            <input
              type="password"
              v-model="password"
              placeholder="Password"
              required
            />
          </div>
          <p class="text-bg-danger">{{ loginError }}</p>
          <button type="submit" class="button">Accedi</button>
        </form>

        <p style="margin-top: 20px;">
          Non hai un account?
          <a @click="goRegister" style="cursor: pointer;">Registrati</a>
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import axios from "../main.js";
import socket from "../plugins/socket.js";

export default {
  data() {
    return {
      username: "",
      password: "",
      loginError: "",
      alreadyLogged: false,
      storedUsername: "",
      countdown: 3,
      countdownInterval: null,
    };
  },
  mounted() {
    const user = localStorage.getItem('username');
    if (user) {
      this.alreadyLogged = true;
      this.storedUsername = user;
      this.startCountdown();
    }
  },
  methods: {
    async onSubmit() {
      try {
        await axios.post("/login", {
          userName: this.username,
          password: this.password
        });
        console.log("Login riuscito");
        socket.emit("username", this.username);
        localStorage.setItem("username", this.username);
        this.$router.push({ name: "Home" });
      } catch (error) {
        console.log("Login fallito:", error.response?.data?.error);
        this.loginError = error.response?.data?.error || "Errore imprevisto di login";
      }
    },
    goRegister() {
      this.$router.push({ name: "Register" });
    },
    startCountdown() {
      // Aggiorna countdown ogni secondo
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 1) {
          this.countdown--;
        } else {
          clearInterval(this.countdownInterval);
          this.$router.push({ name: "Home" });
        }
      }, 1000);
    }
  },
  beforeUnmount() {
    // Pulisce l'intervallo se il componente viene distrutto
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
};
</script>

<style scoped>
/* Stili locali */
</style>
