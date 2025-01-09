const express = require("express");
const router = express.Router();
const gameController = require('../controllers/gameController');

// Rotta per avviare una nuova partita Single Player
router.get('/new', gameController.newSinglePlayerGame);

// Rotta per inserire un numero nella partita Single Player
router.post('/insert', gameController.insertNumber);

module.exports = router;