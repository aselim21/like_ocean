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
const { v4: uuidv4 } = require("uuid");
const PORT = process.env.PORT || 8080;

const server = express()
  .use(express.static("src"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

  //WEB SOCKET
const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});s

//REST server
let ocean_room_id = 0;
let fishData = {
  participants:0,
  user1_id: null,
  user1_offer: null,
  user2_id: null,
  user2_answer: null,
  connection_completed: false
}

// app.post('/oceans', (req, res) => {
//   const req_userId = req.body.userId;
//   if(fishData.participants == 0){
//     fishData.user1_id = req_userId;
//     fishData.participants += 1;
//   }else if(fishData.participants == 1 && fishData.user1_id != req_userId ){
//     fishData.user2_id = req_userId;
//     fishData.participants += 1;
//   }
//   if(ocean_room_id == 0){
//     ocean_room_id = uuidv4();
//   }
//   res.status(200).send(JSON.stringify(ocean_room_id));
// });

// app.get('/oceans/:oceanID', (req, res) => {
//   res.sendFile(path.join(__dirname, '../src', 'room.html'));
// });

// app.get('/participants/:oceanId', (req, res) => {
//   const oceanId = req.params.oceanId;
//   if(oceanId != ocean_room_id){res.sendStatus(404);}
//   res.status(200).send(fishData);
// });

// app.put('/participants/:oceanId', (req, res) => {
//   const oceanId = req.params.oceanId;
//   console.log(req.body);
//   if (req.body.user1_offer) {
//     console.log("Its offer");
//     fishData.user1_offer = req.body.user1_offer;
//   } else if (req.body.user2_answer) {
//     console.log("Its answer");
//     fishData.user2_answer = req.body.user2_answer;
//   } else if (req.body.connection_completed) {
//     console.log("Its completed");
//     fishData.connection_completed = req.body.connection_completed;
//   }
//   res.status(200).send(fishData);
// });

// app.delete('/oceans', (req, res) => {
//   // const oceanId = req.params.oceanId;
//   ocean_room_id = 0;
//   fishData = {
//     participants:0,
//     user1_id: null,
//     user1_offer: null,
//     user2_id: null,
//     user2_answer: null,
//     connection_completed: false
//   }
//   res.status(200).send(fishData);
// });

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);