const GameWithVite = require("./GameWithVite");
const CoopPlayerManager = require("./CoopPlayerManager");

class CoopGame {
    constructor(difficult, lobbyCode) {
        this.game = new GameWithVite(difficult);
        this.lobbyCode = lobbyCode;
        this.coopPlayerManager = new CoopPlayerManager(lobbyCode);
    }

    insertNumberWithoutCheck(row, col, num) {
        this.game.insertNumberWithoutCheck(row, col, num);
    }

    insertNumber(row, col, num) {
        return this.game.insertNumber(row, col, num);
    }

    removePlayer(player) {
        this.coopPlayerManager.removePlayer(player);
    }

    getPlayers() {
        return this.coopPlayerManager.getPlayers();
    }
}

module.exports = CoopGame;