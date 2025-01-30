<script setup>
import { onMounted, ref } from "vue";
import axios from "../main.js";
import OverlayDialog from "./OverlayDialog.vue";

const leaderboardData = ref([]);
const loading = ref(false);

// Emette un evento "close" verso il genitore (Game.vue, ecc.)
const emit = defineEmits(["close"]);

// Carica la leaderboard al mount
onMounted(fetchLeaderboard);

async function fetchLeaderboard() {
  try {
    loading.value = true;
    const res = await axios.get("/game/leaderboard");
    leaderboardData.value = res.data;
  } catch (err) {
    console.error("Errore nel recupero leaderboard:", err);
  } finally {
    loading.value = false;
  }
}

// Emette l’evento di chiusura
function closeLeaderboard() {
  emit("close");
}

// Helper per formattare ms => "mm:ss"
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
  <!-- OverlayDialog gestisce sfondo e contenitore -->
  <OverlayDialog :visible="true" @close="closeLeaderboard">
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
          <td style="width: 10%;">{{ index + 1 }}</td>
          <td style="width: 30%;">{{ record.username }}</td>
          <td style="width: 30%;">{{ formatTime(record.milliseconds) }}</td>
          <td style="width: 30%;">{{ record.difficulty }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottone di chiusura custom (in aggiunta alla X in alto a destra) -->
    <button class="button close-button" @click="closeLeaderboard">
      Chiudi
    </button>
  </OverlayDialog>
</template>

<style scoped>

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

/* Stile del pulsante extra di chiusura in basso */
.close-button {
  margin-top: 10px;
}
</style>
