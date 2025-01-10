<script>
import socket from "../plugins/socket";

export default {
  data() {
    return{
      lobbyName: "",
      players: ""
    }
  },
  mounted() {
    this.lobbyName = sessionStorage.getItem("lobbyCode");
    socket.emit('getPlayersOfLobby', sessionStorage.getItem("lobbyCode"))
    socket.on('playersOfLobby', players => {
      console.log("players"  + players);
      this.players = players;
    })
  }
}
</script>

<template>
  <div>
    <h3>Nome della Lobby: {{ lobbyName }}</h3>
    <ul >
      <li v-for="player in this.players" >{{ player.username }}</li>
    </ul>
  </div>
</template>

<style scoped>

</style>
