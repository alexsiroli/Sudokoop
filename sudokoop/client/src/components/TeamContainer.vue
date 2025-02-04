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
      <li v-for="player in this.team.team">
        <span :style="player.username.endsWith('-eliminated') ? 'text-decoration: line-through;' : ''">
    {{ player.username.replace('-eliminated', '') }}
  </span>
        <span v-if="player.isMaster"> (Master)</span></li>
    </ul>
    <h6>Points: {{ this.team.point }}</h6>
  </div>
</template>

<style scoped>
.team-container {
  width: 17%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: var(--border-radius);
  text-align: center;
  box-shadow: 0 1px 4px var(--shadow-color);
  background-color: var(--box-bg-color);
  margin: 0 5px;
}

.Gialla-team {
  background-color: #fffbe6;
}
.Blu-team {
  background-color: #e6f2ff;
}

.team-container h3 {
  color: black;
  margin: 10px 0;
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

@media (max-width: 768px) {
  .team-container {
    width: 60%; /* Occupa quasi tutta la larghezza su mobile */
    margin: 5%;
  }
}

</style>
