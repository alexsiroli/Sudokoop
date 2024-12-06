import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import Multiplayer from '../views/Multiplayer.vue';
// Nuove importazioni
import SinglePlayer from '../views/SinglePlayer.vue';
import Lobby from '../views/Lobby.vue';
import CoopGame from '../views/CoopGame.vue';
import VersusGame from '../views/VersusGame.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  // Rotta per single player: qui l'utente sceglie la difficoltà prima di iniziare
  { path: '/singleplayer', name: 'SinglePlayer', component: SinglePlayer },
  // Rotta di gioco single player effettivo (accetta un query param ?difficulty=easy|medium|hard)
  { path: '/game', name: 'Game', component: Game },
  // Rotta per la gestione della lobby multiplayer
  { path: '/lobby/:lobbyCode?', name: 'Lobby', component: Lobby },
  // Rotte per le modalità multiplayer vere e proprie
  { path: '/coopgame', name: 'CoopGame', component: CoopGame },
  { path: '/versusgame', name: 'VersusGame', component: VersusGame },
  // Rotta vecchia per multiplayer (puoi rimuoverla o mantenerla)
  { path: '/multiplayer', name: 'Multiplayer', component: Multiplayer },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
