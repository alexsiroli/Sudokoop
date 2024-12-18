const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Utilizzo di bcrypt per la gestione delle password

const router = express.Router();

// Crea un nuovo utente
router.post('/register', async (req, res) => {
    const { name, password } = req.body;
    try {
        // Cerca l'utente per usern
        console.log("name "+ name)
        console.log("password" + password)
        const user = await User.findOne({ userName: name });
        console.log("cerco user" + user)
        if (user) {
            return res.status(401).json({ error: 'Utente già presente. Effettua un login' }); // Utente non trovato
        }
        const hashedPassword = await bcrypt.hash(password, 10); // '10' è il numero di sali (rounds)
        console.log("hashedPass" + hashedPassword)
        const newUser = await User.create({
            userName: name,
            password: password,
        });
        console.log("utenten registrato")
        return res.status(200).json(newUser);
    } catch (err) {
        console.error('Errore durante il salvataggio dell\'utente:', err); // Log dettagliato nel terminale
        res.status(500).json({ error: 'Errore nel salvataggio dell\'utente', details: err.message });
    }
});
// Route per ottenere tutti gli utenti
router.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Recupera tutti gli utenti dal database
        res.status(200).json(users); // Risponde con la lista degli utenti in formato JSON
        console.log("Utenti recuperati con successo!");
    } catch (err) {
        console.error("Errore nel recupero degli utenti:", err);
        res.status(500).json({ error: 'Errore nel recupero degli utenti' });
    }
});

router.post('/login', async (req, res) => {
    const { userName, password } = req.body; // Username e password inviati dal client
    console.log("try login of " + userName + password)
    try {
        // Cerca l'utente per username
        const user = await User.findOne({ userName: userName });
        if (!user) {
            return res.status(401).json({ error: 'Username non trovato' }); // Utente non trovato
        }

        // Verifica la password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Password errata' }); // Password errata
        }

        // Se username e password sono corretti, invia una risposta di successo
        res.status(200).json({ message: 'Login riuscito'});
    } catch (err) {
        console.error('Errore nel login:', err);
        res.status(500).json({ error: 'Errore nel login' });
    }
});
module.exports = router;
