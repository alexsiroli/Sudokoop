import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import Multiplayer from '../views/Multiplayer.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/game', name: 'Game', component: Game },
  { path: '/multiplayer', name: 'Multiplayer', component: Multiplayer },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
