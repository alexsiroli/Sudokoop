<script>
import socket from "../plugins/socket";

export default {
  props: ["turnBack"],
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      confirmPasswordError: "",
      registerError: ""
    }
  },
  methods: {
    onSubmit() {
      if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = "Le password non sono uguali"
      }
      else {
        socket.emit("registerUser", this.username, this.password)
        socket.on("registerSuccess", () => {
          console.log("Registrazione a buon fine")
          this.$router.push({name: 'Home'})
        });
        socket.on("registerFailed", (res) => this.registerError = res)
      }
    }
  }
}
</script>

<template>
  <button class="back-button" @click="this.turnBack" title="Torna Indietro">&#8592;</button>

  <h3>Register</h3>
      <form @submit.prevent="onSubmit()">
        <div class="mb-3">
          <input type="text" v-model="this.username" id="usernameInput" class="form-control" placeholder="Username"
                 required>
        </div>
        <div class="mb-3">
          <input type="password" v-model="this.password" id="passwordInput" class="form-control" placeholder="Password"
                 required>
          <input type="password" v-model="this.confirmPassword" id="passwordInput" class="form-control" placeholder="Confirm password"
                 required>
        </div>
        <p class="text-bg-danger"> {{ this.confirmPasswordError }} </p>
        <p class="text-bg-danger"> {{ this.registerError }} </p>
        <div class="row">
          <button type="submit" class="btn btn-primary col">Registrati</button>
        </div>
      </form>

</template>

<style scoped>

</style>
