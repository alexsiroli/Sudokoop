<script setup>
import { ref, onMounted } from "vue";
import axios from "../main.js";

const leaderboardData = ref([]);
const loading = ref(false);

// Emette un evento per chiudere il pannello leaderboard
const emit = defineEmits(["close"]);

onMounted(fetchLeaderboard);

async function fetchLeaderboard() {
  try {
    loading.value = true;
    const res = await axios.get("/game/leaderboard");
    leaderboardData.value = res.data; // [{ username, milliseconds, difficulty }, ...]
  } catch (err) {
    console.error("Errore nel recupero leaderboard:", err);
  } finally {
    loading.value = false;
  }
}

function closeLeaderboard() {
  emit("close");
}
</script>

<template>
  <div class="leaderboard-overlay">
    <div class="leaderboard-container">
      <h2>Classifica Tempi</h2>
      <div class="leaderboard-scrollable">
        <p v-if="loading">Caricamento classifica...</p>
        <table v-else>
          <thead>
          <tr>
            <th>Pos</th>
            <th>Username</th>
            <th>Tempo (s)</th>
            <th>Difficoltà</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(record, index) in leaderboardData" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ record.username }}</td>
            <td>{{ (record.milliseconds / 1000).toFixed(1) }}</td>
            <td>{{ record.difficulty }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <button class="button close-button" @click="closeLeaderboard">Chiudi</button>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5); /* Semi-trasparenza per "overlay" */
  display: flex;
  align-items: center;
  justify-content: center;
}

.leaderboard-container {
  background-color: white;
  padding: 20px;
  border-radius: 15px;
  width: 500px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}

.leaderboard-scrollable {
  width: 100%;
  max-height: 250px;
  overflow-y: auto; /* scroll se troppi record */
  margin: 10px 0;
}

/* Stili base */
.close-button {
  margin-top: 10px;
}
</style>
