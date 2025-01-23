const GameWithVite = require("./GameWithVite");

class CoopGame {
    constructor(difficult, players) {
        this.game = new GameWithVite(difficult);
        this.players = players;
    }
    insertNumberWithoutCheck(row, col, num) {
        this.game.insertNumberWithoutCheck(row, col, num);
    }
    insertNumber(row, col, num) {
        return this.game.insertNumber(row, col, num);
    }
    removePlayer(username) {
        this.players = this.players.filter(player => player.username !== username);
    }
    getPlayers() {
        return this.players;
    }
}
module.exports = CoopGame;