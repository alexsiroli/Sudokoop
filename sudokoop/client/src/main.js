import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

import './assets/main.css';

axios.defaults.baseURL = 'http://http://54.177.155.194:5001/api';

createApp(App).use(router).mount('#app');

export default axios;
