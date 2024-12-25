import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

import '@/assets/main.css';

axios.defaults.baseURL = process.env.VUE_APP_API_URL;

createApp(App).use(router).mount('#app');
export default axios;
