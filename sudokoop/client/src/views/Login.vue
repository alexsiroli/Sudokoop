<script>
import socket from "../plugins/socket";

export default {
  data() {
    return {
      username: "",
      password: "",
      loginError: "",
    }
  },
  methods: {
    onSubmit() {
      console.log(this.username)
      console.log(this.password)
      socket.emit("login", this.username, this.password)
      socket.on("loginSuccess",  () =>  {
        console.log("loginSuccess")
        this.$router.push({name: 'Home'})
        });
      socket.on("loginFailed", (res) => this.loginError = res)

    }
  }
}
</script>

<template>
  <div class="centered-container">
    <div class="rounded-box lobby-container">
      <h1 class="title">SudoKoop</h1>
      <h3>Login</h3>
      <form @submit.prevent="onSubmit()">
        <div class="mb-3">
          <input type="text" v-model="this.username" id="usernameInput" class="form-control" placeholder="Username"
                 required>
        </div>
        <div class="mb-3">
          <input type="password" v-model="this.password" id="passwordInput" class="form-control" placeholder="Password"
          required>
          <div class="invalid-feedback">
            Please provide a valid city.
          </div>
        </div>
        <h3 class="text-bg-danger"> {{this.loginError}} </h3>
        <div class="row">
          <a class="col fs-5">Registrati</a>
          <button type="submit" class="btn btn-primary col">Accedi</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>
