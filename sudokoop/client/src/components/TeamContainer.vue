<script>

export default {
  props: ['teamName', 'players', 'points'],
  data() {
    return {
        eliminated: [],
    }
  },

  methods: {
    setEliminated(username) {
      console.log("Setting eliminated " + username)
      this.eliminated.push(username)
    }
  }
}
</script>

<template>
  <div :class="['team-container', `${teamName}-team`]">
  <h3>Squadra {{this.teamName}}</h3>
  <ul>
    <li v-for="player in this.players">{{ player.username }} <span v-if="player.isMaster"> (Master)</span>
      <a v-if="eliminated.includes(player)"> - Eliminato</a></li>
  </ul>
    <h6>Points: {{this.points}}</h6>
  </div>
</template>

<style scoped>
.team-container {
  width: 17%; /* Dimensiona le sezioni delle squadre */
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}

.Gialla-team {
  background-color: #fffbe6;
}

.Blu-team {
  background-color: #e6f2ff;
}
.team-container h3 {
  color: black;
}


.team-container ul {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}
h6 {
  color: black;
}
.team-container li {
  color: black;
}
</style>
