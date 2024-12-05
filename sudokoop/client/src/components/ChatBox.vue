<template>
  <div class="chat-box">
    <div class="messages">
      <div v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.user }}:</strong> {{ msg.text }}
      </div>
    </div>
    <form @submit.prevent="sendMessage">
      <input v-model="message" placeholder="Scrivi un messaggio..." />
      <button type="submit">Invia</button>
    </form>
  </div>
</template>

<script>
import socket from '../plugins/socket';

export default {
  name: 'ChatBox',
  data() {
    return {
      message: '',
      messages: [],
    };
  },
  methods: {
    sendMessage() {
      if (this.message.trim() !== '') {
        const msg = {
          user: 'Anonimo', // Puoi sostituire con il nome dell'utente loggato
          text: this.message,
        };
        socket.emit('chatMessage', msg);
        this.message = '';
      }
    },
  },
  mounted() {
    socket.on('message', (msg) => {
      this.messages.push(msg);
    });
  },
  beforeUnmount() {
    socket.off('message');
  },
};
</script>

<style scoped>
.chat-box {
  border: 1px solid #ccc;
  padding: 10px;
  width: 300px;
}

.messages {
  height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}
</style>
