const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const router = express.Router();

// Registrazione
router.post("/register", async (req, res) => {
    const { userName, password } = req.body;
    try {
        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res
              .status(401)
              .json({ error: "Utente già presente. Effettua il login." });
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            userName,
            password: hashedPassword
        });

        return res.status(200).json({ message: "Registrazione riuscita" });
    } catch (err) {
        console.error("Errore durante la registrazione:", err);
        res
          .status(500)
          .json({ error: "Errore nel salvataggio dell'utente", details: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { userName, password } = req.body;
    try {
        // Cerca l'utente per userName
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(401).json({ error: "Username non trovato" });
        }

        // Confronta la password con l'hash nel DB
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Password errata" });
        }

        // Se tutto OK
        return res.status(200).json({ message: "Login riuscito" });
    } catch (err) {
        console.error("Errore nel login:", err);
        res.status(500).json({ error: "Errore nel login" });
    }
});

// (Opzionale) Rotta per ottenere tutti gli utenti
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error("Errore nel recupero degli utenti:", err);
        res.status(500).json({ error: "Errore nel recupero degli utenti" });
    }
});

module.exports = router;
