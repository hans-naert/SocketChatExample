import express from 'express';
import { createServer } from 'node:http';
import path from 'path';
import { Server } from 'socket.io';

import i2c from 'i2c-bus';

const TC74_ADDR = 0x48;
const TEMP_REG = 0x00;
const readTemp = async () => {
    try {
        let i2c1 = await i2c.openPromisified(1);
        let i2c1_byte = await i2c1.readByte(TC74_ADDR, TEMP_REG);
        let rawData = await i2c1_byte;
        console.log(rawData);
        i2c1.close()
        return rawData;
    }
    catch (error) { console.log(error) }
};

const app = express();
const server = createServer(app);
const io = new Server(server);

let timer = setInterval(async () =>{
  let temp=await readTemp();
  //console.log(temp);
  io.emit('chat message',temp)
},5000)

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect',()=> {
    console.log('a user is disconnected')
  });
  socket.on('chat message', (msg) => 
  {
    console.log(`message is ${msg}`);
    io.emit('chat message', msg);
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});