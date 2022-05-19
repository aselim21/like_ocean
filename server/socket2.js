const ws = require('ws');
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.static("src"));
const { v4: uuidv4 } = require("uuid");
const PORT = process.env.PORT || 8080;

const wss = new ws.WebSocketServer({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

// const app = require('express')();
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);

// io.on('connection', () => { 

//     client.on('event', data => { /* … */ });
//     client.on('disconnect', () => { /* … */ });




// });
// server.listen(3000);