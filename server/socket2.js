'use strict';

const express = require('express');
const { Server } = require('ws');
const { v4: uuidv4 } = require("uuid");
const { add } = require('nodemon/lib/rules');
const PORT = process.env.PORT || 8080;

//Server
const server = express()
  .use(express.static("src"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

//Structures
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
        for (let i = this.fishIDs.length - 2; i >= 0; i--) {
          // create pairs backwards starting from the new fishid
          if (swtch == 0) {
            this.fishPairs.push({ f1: _id, f2: this.fishIDs[i].id, connected: false });
            swtch = 1;
          } else {
            this.fishPairs.push({ f1: this.fishIDs[i].id, f2: _id, connected: false });
            swtch = 0;
          }
        }
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

//WEB SOCKET
const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (_message) => {
    let _data;
    try {
      _data = JSON.parse(_message);
    } catch (error) {
      console.log('Error of JSON.Parse')
    }

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
            dataToSend = {
              type: 'oceanID', //oceanID
              message: existingOcean.id
            }
          } else {
            //if there is no free spot for this fish
            dataToSend = {
              type: 0,
              message: 'The ecosystem is full!'
            }
          }
        } else {
          // create a new ocean
          const the_ocean_id = uuidv4();
          const new_ocean = ALL_OCEANS_DATA.addOcean(new OCEAN(the_ocean_id, _data._oceanName, ALL_LOGIN_CREDENTIALS.getMaxFishByOceanName(_data._oceanName)));

          //add the fish inside the ocean
          new_ocean.addFish(_data._fishID, 0);

          dataToSend = {
            type: 'oceanID',
            message: the_ocean_id
          }
        }
      } else {
        dataToSend = {
          type: 0,
          message: 'Wrong login credentials!'
        }
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
            } else if (_data.type == 'f1_connected') {
              dataToSend = {
                type: 'OceanInfoUpdated',
                message: ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishPairs
              }
              notifyFishAboutChanges(_data._oceanID, dataToSend);
            }
  })
  ws.on('close', () => console.log('Client disconnected'));
});

//Helping functions for Web Socket 
function notifyFishAboutNewFish(_oceanID, _exceptionFishId, _data) {
  const ids = ALL_OCEANS_DATA.getOceanByID(_oceanID).fishIDs;
  console.log('==============notifying notifyFishAboutNewFish============');
  ids.forEach(f => {
    if (f.id != _exceptionFishId && f.ms != 0) {
      console.log("should send to", f.id)
      f.ws.send(JSON.stringify(_data));
    }
  })
}
function notifyFishAboutChanges(_oceanID, _data) {
  const ids = ALL_OCEANS_DATA.getOceanByID(_oceanID).fishIDs;
  console.log('==============notifying notifyFishAboutChanges============');
  ids.forEach(f => {
    console.log("should send to", f.id)
    f.ws.send(JSON.stringify(_data));
  })
}

function notifyF2FishAboutNewOffer(_data) {
  const ids = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishIDs;
  const pairs = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishPairs;
  console.log('==============notifying notifyF2FishAboutNewOffer============');
  pairs.forEach(p => {
    if (p.f1 == _data._fishID && p.connected == false) {
      //if i am the F1 then notify
      console.log("should send to", p.f2);
      _data._f2 = p.f2;
      console.log(_data);
      ids.find(f => p.f2 == f.id).ws.send(JSON.stringify(_data))
    }
  })
}
function notifyF1FishAboutAnswer(_data) {
  const ids = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishIDs;
  const pairs = ALL_OCEANS_DATA.getOceanByID(_data._oceanID).fishPairs;
  console.log('==============notifying notifyF1FishAboutAnswer============');
  pairs.every(p => {
    console.log(p);
    if (p.f2 == _data._fishID && p.connected == false) {
      //if i am the F2 then notify
      console.log("should send to", p.f1);
      ids.find(f => p.f1 == f.id).ws.send(JSON.stringify(_data))
      p.connected = true;
      return false;
    }
    return true;
  })
}