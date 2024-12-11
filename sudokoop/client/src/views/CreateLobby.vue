<script>
import socket from '../plugins/socket.js';

export default {
  data() {
    return {
      lobbyName: "",
    }
  },
  props: ["onLobbyCreated"],
  methods: {
    sendLobbyName() {
      console.log("sending " + this.lobbyName);
      socket.emit("lobbyName", this.lobbyName)
      this.onLobbyCreated(this.lobbyName);
    }
  }
}
</script>

<template>
  <form @submit.prevent="this.sendLobbyName">
    <div class="mb-3">
      <label for="lobbyNameTxt" class="form-label">Name of lobby</label>
      <input type="text" class="form-control" id="lobbyNameTxt" v-model="this.lobbyName">
      <button type="submit" class="btn btn-primary">Submit</button>
    </div>
  </form>
</template>

<style scoped>

</style>
