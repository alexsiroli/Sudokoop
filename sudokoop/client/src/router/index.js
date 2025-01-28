import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import Lobby from '../views/Lobby.vue';
import CoopGame from '../views/CoopGame.vue';
import SelectTeamVersusGame from '../views/SelectTeamVersusGame.vue';
import Login from "../views/Login.vue";
import Register from '../views/Register.vue';
import VersusGame from "../views/VersusGame.vue";

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/Home', name: 'Home', component: Home },
  { path: '/game', name: 'Game', component: Game },
  { path: '/lobby/:lobbyCode?', name: 'Lobby', component: Lobby },
  { path: '/coopgame', name: 'CoopGame', component: CoopGame },
  { path: '/selectTeam', name: 'SelectTeamVersusGame', component: SelectTeamVersusGame },
  { path: '/register', name: 'Register', component: Register },
  { path: '/versusGame', name: 'VersusGame', component: VersusGame },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard globale
router.beforeEach((to, from, next) => {
  const username = sessionStorage.getItem('username');

  // Se non sono loggato e sto cercando di andare su una rotta diversa da Login o Register
  if (!username && to.name !== 'Login' && to.name !== 'Register') {
    return next({ name: 'Login' });
  }

  next();
});

export default router;
