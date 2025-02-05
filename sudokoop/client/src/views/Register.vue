<template>
  <div class="centered-container">
    <div class="rounded-box">
      <h2>Registrazione</h2>

      <!-- Se già loggato, mostra un messaggio con countdown -->
      <p v-if="alreadyLogged">
        Sei già loggato come <strong>{{ storedUsername }}</strong>!<br/><br/>
        Verrai reindirizzato tra {{ countdown }}...
      </p>

      <!-- Altrimenti mostra il form di registrazione -->
      <template v-else>
        <form @submit.prevent="onSubmit" class="form-container">
          <input
            type="text"
            v-model="username"
            placeholder="Username"
            min="1"
            required
          />
          <input
            type="password"
            v-model="password"
            placeholder="Password"
            min="1"
            required
          />
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="Conferma Password"
            required
          />

          <p v-if="confirmPassword && password !== confirmPassword" class="error-text">
            Le password non coincidono
          </p>


          <p class="text-bg-danger">{{ registerError }}</p>
          <button class="button" type="submit" :disabled="confirmPassword && password !== confirmPassword">Registrati</button>
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
      confirmPassword: "",
      registerError: "",
      alreadyLogged: false,
      storedUsername: "",
      countdown: 3,
      countdownInterval: null,
    };
  },
  mounted() {
    const username = sessionStorage.getItem('username');
    if (username) {
      //socket.emit("username", username);
      this.alreadyLogged = true;
      this.storedUsername = username;
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
        this.$router.push({name: "Home"});
      } catch (error) {
        this.registerError = error.response?.data?.error || "Errore imprevisto di registrazione";
      }
    },
    goLogin() {
      this.$router.push({name: "Login"});
    },
    startCountdown() {
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 1) {
          this.countdown--;
        } else {
          clearInterval(this.countdownInterval);
          this.$router.push({name: "Home"});
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
.form-container {
  display: flex;
  flex-direction: column;
  max-width: 300px; /* Imposta una larghezza massima */
  margin: auto; /* Centra il form */
  padding: 20px;

}
.form-container input {
  padding: 10px;
  margin-bottom: 15px; /* Spazio tra gli input */
  border: 1px solid #ccc;
}
  .form-container button {
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
.form-container button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

</style>
