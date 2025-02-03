import { io } from 'socket.io-client';

const socket = io('http://http://54.177.155.194:5001', {
  reconnection: true,
});
socket.username = "";
socket.on('connect', () => {
  console.log('Connesso al server!');
});

socket.on('disconnect', () => {
  console.log('Disconnesso dal server!');
});

export default socket;
