const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    isOnline: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("User", UserSchema);