<script>
import socket from "../plugins/socket";
import RegisterComponent from "../components/Register.vue"
export default {
  data() {
    return {
      username: "",
      password: "",
      loginError: "",
      register: false
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
  },
  components: {
    RegisterComponent
  }
}
</script>

<template>
  <div class="centered-container">
    <div class="rounded-box lobby-container">
      <h1 class="title">SudoKoop</h1>
      <RegisterComponent v-if="this.register"></RegisterComponent>
      <div v-else>
      <h3>Login</h3>
      <form @submit.prevent="onSubmit()">
        <div class="mb-3">
          <input type="text" v-model="this.username" id="usernameInput" class="form-control" placeholder="Username"
                 required>
        </div>
        <div class="mb-3">
          <input type="password" v-model="this.password" id="passwordInput" class="form-control" placeholder="Password"
          required>
        </div>
        <h3 class="text-bg-danger"> {{this.loginError}} </h3>
        <div class="row">
          <a class="col fs-5" @click="this.register = true">Registrati</a>
          <button type="submit" class="btn btn-primary col">Accedi</button>
        </div>
      </form>
    </div>
    </div>
  </div>
</template>

<style scoped>

</style>
