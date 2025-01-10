const User = require("../models/User");
const bcrypt = require("bcrypt");

const userController = {
    // Registrazione
    register: async (req, res) => {
        const { userName, password } = req.body;
        try {
            // Verifica se l'utente esiste già
            const existingUser = await User.findOne({ userName });
            if (existingUser) {
                return res.status(401).json({ error: "Utente già presente. Effettua il login." });
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
            return res
                .status(500)
                .json({ error: "Errore nel salvataggio dell'utente", details: err.message });
        }
    },

    // Login
    login: async (req, res) => {
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

            return res.status(200).json({ message: "Login riuscito" });
        } catch (err) {
            console.error("Errore nel login:", err);
            return res.status(500).json({ error: "Errore nel login" });
        }
    },

    // Recupero statistiche (wins e losses)
    getUserStats: async (req, res) => {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ error: "Username richiesto" });
        }
        try {
            const user = await User.findOne({ userName: username });
            if (!user) {
                return res.status(404).json({ error: "Utente non trovato" });
            }
            return res.status(200).json({
                wins: user.wins,
                losses: user.losses
            });
        } catch (err) {
            console.error("Errore nel recupero delle statistiche:", err);
            return res.status(500).json({ error: "Errore interno" });
        }
    },
};

module.exports = userController;