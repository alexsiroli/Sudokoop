<template>
  <div class="centered-container">
    <div class="rounded-box">
      <h2>Login</h2>
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
      <p>
        Non hai un account?
        <a @click="goRegister" style="cursor: pointer;">Registrati</a>
      </p>
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
      loginError: ""
    };
  },
  methods: {
    async onSubmit() {
      try {
        // Chiamata REST per login
        await axios.post("/login", {
          userName: this.username,
          password: this.password
        });
        // Se ok
        console.log("Login riuscito");
        // Emetti l'username al socket
        socket.emit("username", this.username);
        // Salva l'username in localStorage
        localStorage.setItem("username", this.username);

        // Passa alla Home
        this.$router.push({name: "Home"});
      } catch (error) {
        console.log("Login fallito:", error.response?.data?.error);
        this.loginError = error.response?.data?.error || "Errore imprevisto di login";
      }
    },
    goRegister() {
      this.$router.push({name: "Register"});
    }
  }
};
</script>

<style scoped>
/* Stili locali */
</style>
