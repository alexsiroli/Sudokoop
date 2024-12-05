import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  reconnection: true,
});

socket.on('connect', () => {
  console.log('Connesso al server!');
});

socket.on('disconnect', () => {
  console.log('Disconnesso dal server!');
});

export default socket;
