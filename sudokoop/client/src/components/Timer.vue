<script>

export default {
  data() {
    return {
      startTime: 0,
      timeSpent: 0,
      timerInterval: null,
    }
  },
  computed: {
    formattedTime() {
      const totalSeconds = Math.floor(this.timeSpent / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const mm = String(minutes).padStart(2, "0");
      const ss = String(seconds).padStart(2, "0");
      return `${mm}:${ss}`;
    }
  },
  methods: {
    // Avvio cronometro
    startTimer() {
      this.timeSpent = 0;
      this.startTime = Date.now();
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.timeSpent = Date.now() - this.startTime;
      }, 100);
    },
    // Stop cronometro
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
  }
}
</script>

<template>
  <p>Tempo trascorso: {{ formattedTime }}</p>
</template>

<style scoped>

</style>
