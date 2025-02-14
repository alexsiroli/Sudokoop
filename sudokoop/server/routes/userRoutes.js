const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Registrazione
router.post("/register", userController.register);

// Login
router.post("/login", userController.login);

// Logout
router.post("/logout", userController.logout);

// Statistiche utente (wins e losses)
router.get("/stats", userController.getUserStats);

module.exports = router;