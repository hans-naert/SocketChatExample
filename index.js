const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//const {Gpio} = require('onoff');
const gpiod = require('node-gpiod');

const gpio = new gpiod('/dev/gpiochip0');

(async () => {

await gpio.open();


/*app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});*/

// Request an event handle for GPIO 18 to listen for both edges
let input18 = await gpio.request_event(18, gpiod.INPUT_MODE, gpiod.BOTH_EDGE, "button");
//new Gpio(512+18, 'in', 'both');
let output17 = null;
try {
  output17 = await gpio.request_mode(17, gpiod.OUTPUT_MODE, 0, "relay");
} catch (err) {
  console.error('Failed to request GPIO 17 as OUTPUT (is it busy or reserved by the system?)');
  console.error(err);
}
//new Gpio(512+17, 'out');

gpio.attach_event(input18, (err, event) => {
  if (err) return console.error(err);
  console.log(`input18 changed to ${event.id === gpiod.EVENT_FALLING ? "FALLING" : "RISING"}`);
});
/*
input18.watch((err, value) => { 
  if (err) {
    console.error('There was an error', err);
    return;
  }
  console.log('Input 18 value changed to', value);
  io.emit('chat message', 'Input 18 value changed to ' + value);
});
*/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', async (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', async (msg) => {
     io.emit('chat message', msg);
    console.log('message: ' + msg);
    if (output17) {
      const currentValue = await gpio.get_values(output17);
      if (currentValue === 0) {
        await gpio.set_values(output17, 1);
        console.log('set pin state to 1 (turn LED on)');
      } else {
        await gpio.set_values(output17, 0);
        console.log('set pin state to 0 (turn LED off)');
      }
    } else {
      console.log('GPIO 17 not available, skipping toggle.');
    }
 
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

})();