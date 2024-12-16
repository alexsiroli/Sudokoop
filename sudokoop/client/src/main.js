import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5000/api';

createApp(App).use(router).mount('#app');
export default axios;
