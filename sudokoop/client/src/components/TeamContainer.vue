<script>

export default {
  props: ['teamName', 'team'],
  data() {
    return {}
  },

}
</script>

<template>
  <div :class="['team-container', `${teamName}-team`]">
    <h3>Squadra {{ this.teamName }}</h3>
    <ul>
      <li v-for="player in this.team.team">{{ player.username }} <span v-if="player.isMaster"> (Master)</span></li>
    </ul>
    <h6>Points: {{ this.team.point }}</h6>
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
