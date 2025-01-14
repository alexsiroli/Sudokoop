import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import SinglePlayer from '../views/SinglePlayer.vue';
import Lobby from '../views/Lobby.vue';
import CoopGame from '../views/CoopGame.vue';
import SelectTeamVersusGame from '../views/SelectTeamVersusGame.vue';
import CreateLobby from "../views/CreateLobby.vue";
import Login from "../views/Login.vue";
import Register from '../views/Register.vue';

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/Home', name: 'Home', component: Home },
  { path: '/singleplayer', name: 'SinglePlayer', component: SinglePlayer },
  { path: '/game', name: 'Game', component: Game },
  { path: '/lobby/:lobbyCode?', name: 'Lobby', component: Lobby },
  { path: '/coopgame', name: 'CoopGame', component: CoopGame },
  { path: '/selectTeam', name: 'SelectTeamVersusGame', component: SelectTeamVersusGame },
  { path: '/createLobby', name: 'CreateLobby', component: CreateLobby },
  { path: '/register', name: 'Register', component: Register },
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
