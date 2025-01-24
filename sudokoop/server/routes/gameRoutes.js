const express = require("express");
const router = express.Router();
const GameController = require('../controllers/gameController');
const gameController = new GameController();
// Rotte single player
router.get('/new', gameController.newSinglePlayerGame);
router.post('/insert', gameController.insertNumber);

// Rotta per aggiornare win/lose
router.post('/updateStats', gameController.updateStats);

// Rotte tempo e leaderboard
router.post('/time', gameController.saveTime);
router.get('/leaderboard', gameController.getLeaderboard);

module.exports = router;