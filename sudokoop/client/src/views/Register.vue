<template>
  <div class="centered-container">
    <div class="rounded-box">
      <h2>Registrazione</h2>
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
      <p>
        Hai già un account?
        <a @click="goLogin" style="cursor: pointer;">Accedi</a>
      </p>
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
      registerError: ""
    };
  },
  methods: {
    async onSubmit() {
      try {
        // Registrazione via REST
        await axios.post("/register", {
          userName: this.username,
          password: this.password
        });
        console.log("Registrazione riuscita");

        // Salva l'username appena registrato
        localStorage.setItem("username", this.username);

        socket.emit("username", this.username);

        this.$router.push({name: "Home"});
      } catch (error) {
        this.registerError = error.response?.data?.error || "Errore imprevisto di registrazione";
      }
    },
    goLogin() {
      this.$router.push({name: "Login"});
    }
  }
};
</script>

<style scoped>
/* Stili locali */
</style>
