const GameWithVite = require("./GameWithVite");
const playerManager = require("./PlayerManager");

class CoopGame {
    constructor(difficult, lobbyCode) {
        this.game = new GameWithVite(difficult);
        this.lobbyCode = lobbyCode;
        this.players = playerManager.getPlayersOfGame(lobbyCode);
    }
    insertNumberWithoutCheck(row, col, num) {
        this.game.insertNumberWithoutCheck(row, col, num);
    }
    insertNumber(row, col, num) {
        return this.game.insertNumber(row, col, num);
    }
    removePlayer(username) {
        playerManager.removePlayer(this.lobbyCode, username);
        this.players = playerManager.getPlayersOfGame(this.lobbyCode);
    }
    getPlayers() {
        return this.players;
    }
}
module.exports = CoopGame;