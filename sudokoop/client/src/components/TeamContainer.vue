<script>

export default {
  props: ['teamName', 'players']
}
</script>

<template>
  <div :class="['team-container', `${teamName}-team`]">
  <h3>Squadra {{this.teamName}}</h3>
  <ul>
    <li v-for="player in this.players" :key="player">{{ player }}</li>
  </ul>
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

.team-container li {
  color: black;
}
</style>
