const express = require("express");
const router = express.Router();
const gameController = require('../controllers/gameController');

// Rotte single player esistenti
router.get('/new', gameController.newSinglePlayerGame);
router.post('/insert', gameController.insertNumber);

// Nuove rotte per tempo e leaderboard
router.post('/time', gameController.saveTime);
router.get('/leaderboard', gameController.getLeaderboard);

module.exports = router;