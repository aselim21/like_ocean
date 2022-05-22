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
const { add } = require('nodemon/lib/rules');
const PORT = process.env.PORT || 8080;

const server = express()
  .use(express.static("src"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

//variables
class LOGIN_CREDENTIAL {
  constructor(name, pwd, maxFish_nr) {
    this.login_ocean_name = name,
      this.login_ocean_pwd = pwd,
      this.maxFish_nr = maxFish_nr;
  }
}

const ALL_LOGIN_CREDENTIALS = {
  elements: [],
  addCredential: function (_data) {
    this.elements.push(_data);
  },
  // getCredentialByOceanName: function (_data) {
  //   if (this.elements.length > -1) return this.elements.find(e => e.login_ocean_name == _data);
  //   else return 0;
  // },
  credentialsTrue: function (_name, _pwd) {
    if (this.elements.length > -1) return !!this.elements.find(e => e.login_ocean_name == _name && e.login_ocean_pwd == _pwd);
    else return false;
  },
  getMaxFishByOceanName: function (_data) {
    if (this.elements.length > -1) {
      const the_ocean = this.elements.find(e => e.login_ocean_name == _data);
      return the_ocean.maxFish_nr;
    }
    else return 0;
  },
  oceanNameFree: function (_name) {
    if (this.elements.length > -1) return !this.elements.find(e => e.login_ocean_name == _name);
    else return true;
  }
}


// ALL_LOGIN_CREDENTIALS.addCredential(new LOGIN_CREDENTIAL('okyanus', 'okyanus', 2));
// // console.log(ALL_LOGIN_CREDENTIALS.getCredentialByOceanName('okyanus'));
// console.log(ALL_LOGIN_CREDENTIALS.credentialsTrue('okyanus', 'okyanus'));

//hasing pwd https://security.stackexchange.com/questions/110948/password-hashing-on-frontend-or-backend
class FishConnect {
  fish1_id = null;
  fish1_offer = null;
  fish2_id = null;
  fish2_answer = null;
  connection_completed = false;

  saveFish1(_data) {
    if (this.fish1_id != null && loggedInFish != 0) return -1;
    else {
      this.fish1_id = _data;
      loggedInFish++;
      return this;
    }
  }
  saveFish2(_data) {
    if (this.fish2_id != null && loggedInFish != 1) return -1;
    this.fish2_id = _data;
    return this;
  }
  saveFish1Offer(_data) {
    if (this.fish1_offer != null) return -1;
    this.fish1_offer = _data;
    return this;
  }
  saveFish2Answer(_data) {
    if (this.fish2_answer != null) return -1;
    this.fish2_answer = _data;
    return this;
  }
  connectionCompleted(_data) {
    if (this.connectionCompleted != false) return -1;
    this.connection_completed = _data;
    return this;
  }
}
//TEST purpose
// let fishIDs = [1,2,3];
// let fishPairs = [];
// let swtch = 0;
//   for (let i = 0; i < fishIDs.length - 1; i++) {
//     // This is where you'll capture that last value
//     for (let j = i + 1; j < fishIDs.length; j++) {
//       if(swtch == 0 ){
//         fishPairs.push({f1: fishIDs[i] , f2:fishIDs[j]});
//         swtch = 1;
//       }else{
//         fishPairs.push({f1: fishIDs[j] , f2:fishIDs[i]});
//         swtch = 0;
//       }

//     }
//   }
//   console.log(fishPairs)

class OCEAN {
  constructor(id, ocean_name, maxFish_nr) {
    this.id = id,
      this.ocean_name = ocean_name,
      this.maxFish_nr = maxFish_nr;
  }
  fishIDs = [];
  fishPairs = [];

  addFish(_id, _ws) {
    if (this.maxFish_nr > this.fishIDs.length) {
      let swtch = 0;
      this.fishIDs.push({ id: _id, ws: _ws });
      if (this.fishIDs.length != 1) {
        //if there are more then 1 fish, the pairs can be made
        for(let i = this.fishIDs.length-2 ; i>=0 ; i--){ 
          // create pairs backwards starting from the new fishid
          
          if (swtch == 0) {
            this.fishPairs.push({ f1:_id , f2: this.fishIDs[i].id, connected: false });
            swtch = 1;
          } else {
            this.fishPairs.push({ f1: this.fishIDs[i].id, f2: _id, connected: false });
            swtch = 0;
          }
        }
        // for (let i = 0; i < this.fishIDs.length - 1; i++) {
        //   // This is where you'll capture that last value
        //   for (let j = i + 1; j < this.fishIDs.length; j++) {
        //     // if(this.fishPairs.f1 ==)
        //     if (swtch == 0) {
        //       this.fishPairs.push({ f1: this.fishIDs[i].id, f2: this.fishIDs[j].id, connected: false });
        //       swtch = 1;
        //     } else {
        //       this.fishPairs.push({ f1: this.fishIDs[j].id, f2: this.fishIDs[i].id, connected: false });
        //       swtch = 0;
        //     }
        //   }
        // }
        return this.fishPairs;
      } return 1;
    } else return 0;
  }
  fishExists(_id) {
    if (this.fishIDs.length > -1) return !!this.fishIDs.find(e => e.id == _id);
    else return false;
  }
  saveWSforFish(_fishID, _ws) {
    const index = this.fishIDs.findIndex(f => f.id == _fishID);
    if (index > -1) {
      this.fishIDs[index].ws = _ws
      return 1;
    } return 0;
  }
}

const ALL_OCEANS_DATA = {
  elements: [],
  getOceanByName: function (_name) {
    if (this.elements.length > -1) {
      const result = this.elements.find(e => e.ocean_name == _name);
      if (!result) return 0;
      else return result;
    }
    else return 0;
  },
  addOcean: function (_data) {
    this.elements.push(_data);
    return this.elements[this.elements.length - 1];
  },
  getOceanByID: function (_id) {
    if (this.elements.length > -1) {
      const result = this.elements.find(e => e.id == _id);
      // console.log(result);
      if (!result) return 0;
      else return result;
    }
    else return 0;
  },
  deleteOceanByID: function (_ocean_id) {
    const index = this.elements.findIndex((e) => e.id == _ocean_id);
    if (index > -1) {
      this.elements.splice(index, 1);
      return index;
    }
    return 0;
  }
}
// ALL_OCEANS_DATA.addOcean(new OCEAN('1234', "OCEAN1", 2));
// console.log(ALL_OCEANS_DATA.getOceanByID('1234').fishExists('Achelia'));
// console.log(ALL_OCEANS_DATA.deleteOceanByID('1234'));
// console.log(ALL_OCEANS_DATA.getOceanByID('1234'));


//WEB SOCKET
const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // wss.clients.forEach((client) => {
  //   //     client.send(new Date().toTimeString());
  //   //   });
  ws.on('message', (_message) => {
    let _data;
    try {
      _data = JSON.parse(_message);
    } catch (error) {
      console.log('PROBLEM!!!! with PARSE')
    }
    // console.log(_data);

    let dataToSend;

    if (_data.type == 'hello') {
      console.log(_data);
    } else if (_data.type == 'login') {
      const LoginSuccessful = ALL_LOGIN_CREDENTIALS.credentialsTrue(_data._oceanName, _data._pwd);
      if (LoginSuccessful == true) {
        // check if there is an existing ocean already
        const existingOcean = ALL_OCEANS_DATA.getOceanByName(_data._oceanName);
        if (!!existingOcean) {

          //try to add the fish to the existing ocean
          const FishAddSuccessful = existingOcean.addFish(_data._fishID, 0);
          if (!!FishAddSuccessful) {
            // if fish added to the ocean
            // console.log(ALL_OCEANS_DATA.getOceanByID(existingOcean.id).fishPairs)
            dataToSend = {
              type: 'oceanID', //oceanID
              message: existingOcean.id
            }
            // console.log( existingOcean.fishIDs);
            // existingOcean.fishIDs.forEach( f => {
            //   if(f.id != _data._fishID){
            //     console.log("should send to",f.id)
            //     f.ws.send(JSON.stringify(dataToSend));
            //   }
            // })


          } else {
            //if there is no free spot for this fish
            dataToSend = {
              type: 0,
              message: 'The ecosystem is full!'
            }
            // ws.send(0,'The ecosystem is full!');
          }
        } else {
          // create a new ocean
          const the_ocean_id = uuidv4();
          // console.log(the_ocean_id);
          // ALL_OCEANS_DATA.getOceanByID(the_ocean_id);
          // console.log(ALL_LOGIN_CREDENTIALS.getMaxFishByOceanName(_data._oceanName));

          const new_ocean = ALL_OCEANS_DATA.addOcean(new OCEAN(the_ocean_id, _data._oceanName, ALL_LOGIN_CREDENTIALS.getMaxFishByOceanName(_data._oceanName)));

          //add the fish inside the ocean
          new_ocean.addFish(_data._fishID, 0);

          dataToSend = {
            type: 'oceanID',
            message: the_ocean_id
          }
          // ws.send(1,the_ocean_id);
        }
      } else {
        dataToSend = {
          type: 0,
          message: 'Wrong login credentials!'
        }
        // ws.send(0, 'Wrong login credentials!');
      }
      ws.send(JSON.stringify(dataToSend));
    } else if (_data.type == 'register') {
      if (ALL_LOGIN_CREDENTIALS.oceanNameFree(_data._oceanName)) {
        ALL_LOGIN_CREDENTIALS.addCredential(new LOGIN_CREDENTIAL(_data._oceanName, _data._pwd, _data._MaxFish));
        dataToSend = {
          type: 1,
          message: 'Ocean successfully created'
        }
      } else {
        dataToSend = {
          type: 0,
          message: 'Ocean already exists'
        }
      }
      ws.send(JSON.stringify(dataToSend));
    } else

      if (_data.type == 'clean') {
        const LoginSuccessful = ALL_LOGIN_CREDENTIALS.credentialsTrue(_data._oceanName, _data._pwd);
        if (LoginSuccessful == true) {
          const the_ocean_id = ALL_OCEANS_DATA.getOceanByName(_data._oceanName).id;
          ALL_OCEANS_DATA.deleteOceanByID(the_ocean_id);
          dataToSend = {
            type: 1,
            message: 'Ocean successfully cleaned'
          }
        } else {
          dataToSend = {
            type: 0,
            message: 'Wrong login credentials!'
          }
        }
        ws.send(JSON.stringify(dataToSend));
      } else

        if (_data.type == 'StartSignaling') {
          let fishExists;
          try {
            fishExists = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishExists(_data._fishID);
          } catch (error) {
            console.log(error);
          }
          if (fishExists) {
            ALL_OCEANS_DATA.getOceanByID(_data._oceanID).saveWSforFish(_data._fishID, ws)
            dataToSend = {
              type: 'OceanInfoUpdated',
              message: ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishPairs
            }
            notifyFishAboutNewFish(_data._oceanID, _data._fishID, dataToSend);
          } else {
            dataToSend = {
              type: 0,
              message: 'You do NOT have permission to be here'
            }
          }
          ws.send(JSON.stringify(dataToSend));
        } else
          if (_data.type == 'f1_offer') {
            //send the offer to all the second users
            notifyF2FishAboutNewOffer(_data);
          } else
            if (_data.type == 'f2_answer') {
              //send the offer to all the second users
              console.log('should notify ff1 for answer');
              notifyF1FishAboutAnswer(_data);
            } else if (_data.type == 'endCall') {
              ALL_OCEANS_DATA.deleteOceanByID(_data._oceanID);
              dataToSend = {
                type: 1,
                message: 'Ocean successfully cleaned'
              }
              ws.send(JSON.stringify(dataToSend));
            }else if(_data.type == 'f1_connected'){
              dataToSend = {
                type: 'OceanInfoUpdated',
                message: ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishPairs
              }
              notifyFishAboutChanges(_data._oceanID, dataToSend);
            
            }
    // if(_data.type == 'f1_connected'){
    //   //send the offer to all the second users
    //   changeStatusOfPeerConnection(_data);
    // }

  })
  // ws.on('login', (_oceanName, _pwd, _fishID) => {
  //   //check if there is already an ocean;
  //   //check if there are already 2 users
  //   // if(ALL_LOGIN_CREDENTIALS.getCredentialByOceanName(_oceanName).maxFish_nr < ALL_OCEAN_DATA)
  //   //check if the pwd is correct
  //   const LoginSuccessful = ALL_LOGIN_CREDENTIALS.credentialsTrue(_oceanName, _pwd);
  //   if (LoginSuccessful == true) {
  //     // check if there is an existing ocean already
  //     const existingOcean = ALL_OCEANS_DATA.getOceanByName(_oceanName);
  //     if (!!existingOcean) {
  //       //try to add the fish to the existing ocean
  //       const FishAddSuccessful = existingOcean.addFish(_fishID);
  //       if (!!FishAddSuccessful) {
  //         //if fish added to the ocean
  //         ws.send(1, existingOcean.id);
  //       } else {
  //         //if there is no free spot for this fish
  //         ws.send(0, 'The ecosystem is full!');
  //       }
  //     } else {
  //       // create a new ocean
  //       const the_ocean_id = uuidv4();

  //       ALL_OCEANS_DATA.addOcean(uuidv4(),  _oceanName, ALL_LOGIN_CREDENTIALS.getMaxFishByOceanName(_oceanName))
  //       ws.send(1, the_ocean_id);
  //     }
  //   }
  //   else ws.send(0, 'Wrong login credentials!');
  // })
  // ws.on('register', (_name, _pwd, _MaxFish) => {
  //   if (ALL_LOGIN_CREDENTIALS.oceanNameFree(_name)) {
  //     ALL_LOGIN_CREDENTIALS.addCredential(new LOGIN_CREDENTIAL(_name, _pwd, _MaxFish));
  //     ws.send("Ocean successfully created");
  //   }
  // })
  // ws.on('OceanInfoReq', (_oceanID, _fishID) => {
  //   if (ALL_OCEANS_DATA.getOceanByID(_oceanID).fishExists(_fishID)) {
  //     ws.send(1, ALL_OCEANS_DATA.getOceanByID(_oceanID));
  //   }
  //   else ws.send(1, 'You do NOT gave permission to be here');
  // });















  ws.on('close', () => console.log('Client disconnected'));
});



// server.post('/oceans', (req, res) => {
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

// server.get('/oceans/:oceanID', (req, res) => {
//   res.sendFile(path.join(__dirname, '../src', 'room.html'));
// });

// server.get('/participants/:oceanId', (req, res) => {
//   const oceanId = req.params.oceanId;
//   if(oceanId != ocean_room_id){res.sendStatus(404);}
//   res.status(200).send(fishData);
// });

// server.put('/participants/:oceanId', (req, res) => {
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

// server.delete('/oceans', (req, res) => {
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

// setInterval(() => {
//   wss.clients.forEach((client) => {
//     client.send(new Date().toTimeString());
//   });
// }, 1000);

function notifyFishAboutNewFish(_oceanID, _exceptionFishId, _data) {
  const ids = ALL_OCEANS_DATA.getOceanByID(_oceanID).fishIDs;
  console.log('==============notifying============');

  ids.forEach(f => {
    if (f.id != _exceptionFishId && f.ms != 0) {
      console.log("should send to", f.id)
      f.ws.send(JSON.stringify(_data));
    }
  })
}
function notifyFishAboutChanges(_oceanID, _data) {
  const ids = ALL_OCEANS_DATA.getOceanByID(_oceanID).fishIDs;
  console.log('==============notifying============');

  ids.forEach(f => {
    // if (f.id != _exceptionFishId && f.ms != 0) {
      console.log("should send to", f.id)
      f.ws.send(JSON.stringify(_data));
    // }
  })
}

function notifyF2FishAboutNewOffer(_data) {
  const ids = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishIDs;
  const pairs = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishPairs;
  pairs.forEach(p => {
    if (p.f1 == _data._fishID && p.connected == false) {
      //if i am the F1 then notify
      console.log("should send offer to", p.f2);
      _data._f2 = p.f2;
      console.log(_data);
      ids.find(f => p.f2 == f.id).ws.send(JSON.stringify(_data))
    }
  })
}
function notifyF1FishAboutAnswer(_data) {
  const ids = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishIDs;
  const pairs = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishPairs;
  pairs.every(p => {
    console.log('in the loop');
    console.log(p);
    if (p.f2 == _data._fishID && p.connected == false) {
      //if i am the F2 then notify
      console.log("should send answer to", p.f1);
      ids.find(f => p.f1 == f.id).ws.send(JSON.stringify(_data))
      p.connected = true;
      return false;
    }
    return true;
  })
}
// function changeStatusOfPeerConnection(_data){
//   const pairs = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishPairs;
//   pairs.forEach(p=>{
//     if(p.f2 == _data._f2 && p.f1 == _data._f1 && p.connected == false){
//       console.log("change status of connection");
//       p.connected = true;
//     }
//   })

// }