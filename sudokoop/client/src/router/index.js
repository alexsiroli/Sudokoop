/**
 * @file index.js
 * @description Configurazione del router per la navigazione nell'app Vue.
 * Definisce le rotte principali dell'applicazione e gestisce i permessi di accesso tramite un Navigation Guard.
 */

import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import Lobby from '../views/Lobby.vue';
import CoopGame from '../views/CoopGame.vue';
import SelectTeamVersusGame from '../views/SelectTeamVersusGame.vue';
import Login from "../views/Login.vue";
import Register from '../views/Register.vue';
import VersusGame from "../views/VersusGame.vue";

// Definizione delle rotte dell'applicazione
const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/Home', name: 'Home', component: Home },
  { path: '/game', name: 'Game', component: Game },
  { path: '/lobby/:lobbyCode?', name: 'Lobby', component: Lobby }, // Lobby opzionale con codice
  { path: '/coopgame', name: 'CoopGame', component: CoopGame },
  { path: '/selectTeam', name: 'SelectTeamVersusGame', component: SelectTeamVersusGame },
  { path: '/register', name: 'Register', component: Register },
  { path: '/versusGame', name: 'VersusGame', component: VersusGame },
];

// Creazione del router con cronologia del browser
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Navigation Guard globale per la protezione delle rotte.
 * Verifica se l'utente è loggato prima di accedere a determinate pagine.
 */
router.beforeEach((to, from, next) => {
  const username = sessionStorage.getItem('username');

  // Se l'utente non è loggato e prova ad accedere a pagine protette, viene reindirizzato al Login
  if (!username && to.name !== 'Login' && to.name !== 'Register') {
    return next({ name: 'Login' });
  }

  next(); // Permette la navigazione se i controlli sono superati
});

export default router;
