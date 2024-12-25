<script>
import axios from "../main.js"; // o direttamente from 'axios', se preferisci

export default {
  props: ["turnBack"],
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      confirmPasswordError: "",
      registerError: ""
    };
  },
  methods: {
    async onSubmit() {
      // Reset messaggi di errore
      this.confirmPasswordError = "";
      this.registerError = "";

      // Verifica che le password coincidano
      if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = "Le password non sono uguali";
        return;
      }

      try {
        // Chiamata REST al backend per registrare l'utente
        await axios.post("/register", {
          userName: this.username,
          password: this.password
        });
        console.log("Registrazione a buon fine");
        // Reindirizza alla home
        this.$router.push({ name: "Home" });
      } catch (err) {
        // Gestione di eventuali errori (es: username già esistente)
        if (err.response && err.response.data && err.response.data.error) {
          this.registerError = err.response.data.error;
        } else {
          this.registerError = "Errore imprevisto nella registrazione";
        }
      }
    }
  }
};
</script>

<template>
  <div>
    <!-- Pulsante per tornare indietro -->
    <button class="back-button" @click="turnBack" title="Torna Indietro">&#8592;</button>

    <h3>Register</h3>
    <form @submit.prevent="onSubmit()">
      <div class="mb-3">
        <input
          type="text"
          v-model="username"
          id="usernameInput"
          class="form-control"
          placeholder="Username"
          required
        />
      </div>
      <div class="mb-3">
        <input
          type="password"
          v-model="password"
          id="passwordInput"
          class="form-control"
          placeholder="Password"
          required
        />
        <input
          type="password"
          v-model="confirmPassword"
          id="confirmPasswordInput"
          class="form-control"
          placeholder="Confirm password"
          required
        />
      </div>
      <!-- Eventuali messaggi di errore -->
      <p class="text-bg-danger">{{ confirmPasswordError }}</p>
      <p class="text-bg-danger">{{ registerError }}</p>

      <div class="row">
        <button type="submit" class="btn btn-primary col">Registrati</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Stili specifici del componente, se necessari */
</style>
