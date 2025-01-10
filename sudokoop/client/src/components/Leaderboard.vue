<script setup>
import {ref, onMounted} from "vue";
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

// Helper per formattare ms in mm:ss
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}
</script>

<template>
  <div class="leaderboard-overlay">
    <div class="leaderboard-container">
      <h2>Classifica Tempi</h2>
      <div class="leaderboard-scrollable">
        <p v-if="loading">Caricamento classifica...</p>
        <table v-else>
          <tbody>
          <tr
            v-for="(record, index) in leaderboardData"
            :key="index"
            class="leaderboard-row"
          >
            <!-- Niente thead, mostriamo i dati direttamente -->
            <td style="width: 10%;">{{ index + 1 }}</td>
            <td style="width: 30%;">{{ record.username }}</td>
            <td style="width: 30%;">{{ formatTime(record.milliseconds) }}</td>
            <td style="width: 30%;">{{ record.difficulty }}</td>
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.leaderboard-container {
  background-color: var(--box-bg-color);
  color: var(--text-color);
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
  overflow-y: auto;
  margin: 10px 0;
}

.leaderboard-row {
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

table td {
  border-bottom: 1px solid #ccc;
  padding: 8px;
}

.close-button {
  margin-top: 10px;
}
</style>
