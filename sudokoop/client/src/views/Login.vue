<script>
import axios from "../main.js";
import RegisterComponent from "../components/Register.vue";

export default {
  data() {
    return {
      username: "",
      password: "",
      loginError: "",
      register: false // toggle per mostrare/nascondere il form di registrazione
    };
  },
  methods: {
    async onSubmit() {
      try {
        // Chiamata REST al backend per il login
        await axios.post("/login", {
          userName: this.username,
          password: this.password
        });
        console.log("loginSuccess");
        this.$router.push({ name: "Home" });
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          this.loginError = err.response.data.error;
        } else {
          this.loginError = "Errore di login";
        }
      }
    },
    hidRegister() {
      this.register = false;
    }
  },
  components: {
    RegisterComponent
  }
};
</script>

<template>
  <div class="centered-container">
    <div class="rounded-box lobby-container">
      <h1 class="title">SudoKoop</h1>
      <!-- Mostra il componente Register se register == true -->
      <RegisterComponent
        v-if="register"
        :turnBack="hidRegister"
      />
      <!-- Altrimenti mostra il form di login -->
      <div v-else>
        <h3>Login</h3>
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
          </div>
          <h3 class="text-bg-danger">{{ loginError }}</h3>
          <div class="row">
            <!-- Cliccando su "Registrati", mostriamo il form di registrazione -->
            <a class="col fs-5" @click="register = true">Registrati</a>
            <button type="submit" class="btn btn-primary col">Accedi</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Stili specifici del componente, se necessari */
</style>
