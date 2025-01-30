<script>

export default {
  props: ['players'],
  data() {
    return {
      lobbyName: "",
    }
  },
  mounted() {
    this.lobbyName = sessionStorage.getItem("lobbyCode");
  }
}
</script>

<template>
  <div>
    <h3>Nome della Lobby: {{ lobbyName }}</h3>
    <ul>
      <li v-for="player in this.players">{{ player.username }} <span v-if="player.isMaster"> (Master)</span></li>
    </ul>
  </div>
</template>
