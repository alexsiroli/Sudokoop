const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://mongo:27017/sudokoopDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connesso con successo');
    } catch (err) {
        console.error(`Errore nella connessione a MongoDB: ${err.message}`);
        process.exit(1); // Termina l'app se non riesce a connettersi
    }
};

module.exports = connectDB;
