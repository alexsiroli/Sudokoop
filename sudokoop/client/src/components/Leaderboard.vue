/**
* @file Leaderboard.vue
* @description Componente per la visualizzazione della classifica dei tempi di gioco.
* Mostra i migliori tempi registrati per diverse difficoltà e permette di chiudere l'overlay.
*/

<script setup>
import { onMounted, ref } from "vue";
import axios from "../main.js";
import OverlayDialog from "./OverlayDialog.vue";

const leaderboardData = ref([]);
const loading = ref(false);

// Emette un evento "close" verso il genitore
const emit = defineEmits(["close"]);

// Carica la leaderboard al mount
onMounted(fetchLeaderboard);

/**
 * Recupera i dati della classifica dal server.
 */
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

/**
 * Emette l'evento di chiusura per chiudere l'overlay.
 */
function closeLeaderboard() {
  emit("close");
}

/**
 * Converte i millisecondi in formato "mm:ss".
 */
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
        <tr v-for="(record, index) in leaderboardData" :key="index" class="leaderboard-row">
          <td style="width: 10%;">{{ index + 1 }}</td>
          <td style="width: 30%;">{{ record.username }}</td>
          <td style="width: 30%;">{{ formatTime(record.milliseconds) }}</td>
          <td style="width: 30%;">{{ record.difficulty }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottone di chiusura -->
    <button class="button close-button" @click="closeLeaderboard">Chiudi</button>
  </OverlayDialog>
</template>

<style scoped>
/**
 * Contenitore scrollabile della classifica.
 */
.leaderboard-scrollable {
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  margin: 10px 0;
  box-shadow: inset 0 1px 3px var(--shadow-color);
  border-radius: var(--border-radius);
  background-color: var(--box-bg-color);
}

/**
 * Stile della tabella per la classifica.
 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.leaderboard-row {
  width: 100%;
}

table td {
  border-bottom: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

/**
 * Stile del bottone di chiusura.
 */
.close-button {
  margin-top: 10px;
  border-radius: var(--border-radius);
  padding: 10px 20px;
}
</style>
