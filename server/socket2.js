// const ws = require('ws');
// const express = require('express');
// const app = express();
// const path = require('path');
// app.use(express.json());
// app.use(express.static("src"));
// const { v4: uuidv4 } = require("uuid");
// const PORT = process.env.PORT || 8080;

// const wss = new ws.WebSocketServer({ port: PORT });

// wss.on('connection', function connection(ws) {
//   ws.on('message', function message(data) {
//     console.log('received: %s', data);
//   });

//   ws.send('something');
// });

// const app = require('express')();
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);
// const PORT = process.env.PORT || 8080;

// io.on('connection', () => { 

//   socket.send(JSON.stringify({
//     type: "hello from server",
//     content: [ 1, "2" ]
//   }));
//     client.on('event', data => { /* … */ 

//   });
//     client.on('disconnect', () => { /* … */ 

//   });
//   socket.on("message", (data) => {
    
//   })

// });
// server.listen(PORT);

//Kyle
//npm run devStart
// const express = require('express');
// const app = express();
// const server = require('http').Server(app);
// const io = require('socket.io')(server);
// const { v4: uuidV4 } = require('uuid');

// const path = require('path');
// app.use(express.json());
// app.use(express.static("src"));

// app.set('view engine', 'ejs')
// // app.use(express.static('public'))

// // app.get('/', (req, res) => {
// //   res.redirect(`/${uuidV4()}`)
// // })

// app.get('/:room', (req, res) => {
//   res.render('room', { roomId: req.params.room })
// })

// io.on('connection', socket => {
//   // socket.on('join-room', (roomId, userId) => {
//   //   socket.join(roomId)
//   //   socket.to(roomId).broadcast.emit('user-connected', userId)

//   //   socket.on('disconnect', () => {
//   //     socket.to(roomId).broadcast.emit('user-disconnected', userId)
//   //   })
//   // })
//   io.send('something');
//   io.on("message", (data) => {
//     console.log(data);
//   }
//   );
// });

// server.listen(3000);

//https://devcenter.heroku.com/articles/node-websockets

'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 8080;

const server = express()
  .use(express.static("src"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);