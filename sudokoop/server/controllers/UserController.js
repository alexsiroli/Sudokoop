// gestione lobby multiplayer

// lista di lobby, ognuna con un nome. Metodi per creare, fare join in una lobby

class UserController {

    // gestione di lobby:
    // metodo createLobby: controlla che non esiste gia
    constructor() {
        this.lobbies = [];
        this.lobbyNames = ["Cat", "Dog", "Chicken", "Mouse"]
    }
    findLobby(name) {
        return this.lobbies.find(x => x.name === name)
    }
    createLobby(player) {
        console.log("lobby presenti: " + this.lobbies)
        const lobbyName = this.lobbyNames.pop();
        this.lobbies += new Lobby(lobbyName, player)
        return lobbyName;
    }
    getPlayersOfLobby(name) {
        const lobby = this.findLobby(name);
        if (lobby === undefined) {
            console.log("This lobby doesn't exists")
        } else {
            return lobby.players;
        }
    }
    joinLobby(name, player) {
        const lobby = this.findLobby(name);
        if (lobby === undefined) {
            console.log("This lobby doesn't exists")
            return false;
        } else {
            console.log("adding " +player + "to " + name);
            lobby.addPlayer(player)
            return true;
        }
    }
}
module.exports = UserController;

class Lobby{
    constructor(name, player) {
        this.name = name;
        this.players = [player];
    }
    addPlayer(player) {
        this.players.push(player);
    }
}