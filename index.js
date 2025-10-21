const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const {Gpio} = require('onoff');

/*app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});*/

let input18 = new Gpio(512+18, 'in', 'both');
let output17 = new Gpio(512+17, 'out');

input18.watch((err, value) => { 
  if (err) {
    console.error('There was an error', err);
    return;
  }
  console.log('Input 18 value changed to', value);
  io.emit('chat message', 'Input 18 value changed to ' + value);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
     io.emit('chat message', msg);
    console.log('message: ' + msg);
    output17.readSync() === 0 ? output17.writeSync(1) : output17.writeSync(0);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});