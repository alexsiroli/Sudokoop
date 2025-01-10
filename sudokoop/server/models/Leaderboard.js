const mongoose = require("mongoose");

const LeaderboardSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    milliseconds: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        default: "easy"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Esporta il modello
module.exports = mongoose.model("Leaderboard", LeaderboardSchema);