<template>
  <div class="centered-container">
    <div class="rounded-box">
      <h2>Registrazione</h2>

      <!-- Se già loggato, mostra un messaggio con countdown -->
      <p v-if="alreadyLogged">
        Sei già loggato come <strong>{{ storedUsername }}</strong>!<br /><br />
        Verrai reindirizzato tra {{ countdown }}...
      </p>

      <!-- Altrimenti mostra il form di registrazione -->
      <template v-else>
        <form @submit.prevent="onSubmit">
          <input
            type="text"
            v-model="username"
            placeholder="Username"
            required
          />
          <input
            type="password"
            v-model="password"
            placeholder="Password"
            required
          />
          <p class="text-bg-danger">{{ registerError }}</p>
          <button class="button" type="submit">Registrati</button>
        </form>
        <p style="margin-top: 20px;">
          Hai già un account?
          <a @click="goLogin" style="cursor: pointer;">Accedi</a>
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import axios from "../main.js";
import socket from "../plugins/socket.js";

export default {
  name: "Register",
  data() {
    return {
      username: "",
      password: "",
      registerError: "",
      alreadyLogged: false,
      storedUsername: "",
      countdown: 3,
      countdownInterval: null,
    };
  },
  mounted() {
    const user = sessionStorage.getItem('username');
    if (user) {
      this.alreadyLogged = true;
      this.storedUsername = user;
      this.startCountdown();
    }
  },
  methods: {
    async onSubmit() {
      try {
        await axios.post("/register", {
          userName: this.username,
          password: this.password
        });
        sessionStorage.setItem("username", this.username);
        socket.emit("username", this.username);
        this.$router.push({ name: "Home" });
      } catch (error) {
        this.registerError = error.response?.data?.error || "Errore imprevisto di registrazione";
      }
    },
    goLogin() {
      this.$router.push({ name: "Login" });
    },
    startCountdown() {
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
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
};
</script>

<style scoped>
/* Stili locali */
</style>
