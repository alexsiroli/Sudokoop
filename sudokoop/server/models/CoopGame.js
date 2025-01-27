const GameWithVite = require("./GameWithVite");
const CoopPlayerManager = require("./CoopPlayerManager");

class CoopGame {
    constructor(difficult, lobbyCode) {
        console.log("Coop game constructor");
        console.log("code " + lobbyCode)
        console.log("difficult " + difficult)
        this.difficulty = difficult;
        this.game = new GameWithVite(difficult);
        this.lobbyCode = lobbyCode;
        this.coopPlayerManager = new CoopPlayerManager(lobbyCode);
        console.log("Players " + this.coopPlayerManager.getPlayers());
    }

    getDifficulty() {
        return this.difficulty;
    }
    getVite() {
        return this.game.vite;
    }

    getSudoku() {
        return this.game.sudoku.puzzle;
    }

    insertNumberWithoutCheck(row, col, num) {
        return this.game.insertNumberWithoutCheck(row, col, num);
    }

    insertNumber(row, col, num) {
        return this.game.insertNumber(row, col, num);
    }

    removePlayer(username) {
        this.coopPlayerManager.removePlayer(username);
    }

    getPlayers() {
        return this.coopPlayerManager.getPlayers();
    }
}

module.exports = CoopGame;