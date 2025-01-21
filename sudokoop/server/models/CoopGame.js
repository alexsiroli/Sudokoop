const GameWithVite = require("./GameWithVite");

class CoopGame {
    constructor(difficult, players) {
        this.game = new GameWithVite(difficult, players);
        this.players = players;
    }
    removePlayer(username) {
        this.players = this.players.filter(player => player.username !== username);
    }
    getPlayers() {
        return this.players;
    }
}
module.exports = CoopGame;