<template>
  <div class="chat-box">
    <div class="messages">
      <div v-for="message in messages" :key="message.id">
        {{ message.text }}
      </div>
    </div>
    <input v-model="newMessage" @keyup.enter="sendMessage" class="input" placeholder="Scrivi un messaggio..." />
    <button @click="sendMessage" class="button">Invia</button>
  </div>
</template>

<script>
export default {
  name: 'ChatBox',
  data() {
    return {
      messages: [],
      newMessage: '',
    };
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        // Logica di invio messaggio
        this.messages.push({ id: Date.now(), text: this.newMessage });
        this.newMessage = '';
      }
    },
  },
};
</script>

<style scoped>
.chat-box {
  border: 1px solid #ccc;
  padding: 10px;
  width: 300px;
  background-color: var(--box-bg-color);
  border-radius: 5px;
}
.messages {
  height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}
</style>
