// gestione lobby multiplayer

// lista di lobby, ognuna con un nome. Metodi per creare, fare join in una lobby

class UserController {
    // gestione di lobby:
    // metodo createLobby: controlla che non esiste gia
    constructor() {
        this.lobbies = [];
    }
    findLobby(name) {
        return this.lobbies.find(x => x.name === name)
    }
    createLobby(name, player) {
        console.log("lobby presenti: " + this.lobbies)
        console.log("creating lobby" + name)
        if (this.findLobby(name) === undefined) {
            this.lobbies.push(new Lobby(name, player));
        } else {
            console.log("lobby "+name + " already exists!");
        }
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
        } else {
            console.log("adding " +player + "to " + name);
            lobby.addPlayer(player)
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