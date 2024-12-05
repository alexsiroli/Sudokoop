// server/sockets/index.js

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Handle cell updates from clients
        socket.on('cellUpdate', (cellData) => {
            // Optionally, validate the cell data here

            // Broadcast the cell update to other clients
            socket.broadcast.emit('gridUpdate', cellData);

            // Update the game state in the database if necessary
        });

        // Handle chat messages
        socket.on('chatMessage', (msg) => {
            io.emit('message', msg); // Broadcast to all connected clients
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
