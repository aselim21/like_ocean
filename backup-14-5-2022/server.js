const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.static("src"));
const { v4: uuidv4 } = require("uuid");
const PORT = process.env.PORT || 3000;
const logs = {
  info: [],
  warning: [],
  error: []
};

function getTime() {
  var today = new Date();
  var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + ' ' + time;

}
app.use((req, res, next) => {
  const corsWhitelist = [
    // 'https://webrtc-englingo.herokuapp.com',
    'http://127.0.0.1:3000',
    'http://localhost:3000'
  ];
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Access-Control-Allow-Headers, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Cookie, Set-Cookie, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
  next();
});

let ocean_room = [](2);



//~~~~~~~~~~~~~~~~~~~~~~~~~~RESTful Service - Methods~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src', 'index.html'));
});
app.get('/logs', (req, res) => {
  res.send(JSON.stringify(logs));
});

app.post('/oceans', (req, res) => {
  const req_userId = req.body.userId;
  // const req_ocean_id = req.body.ocean_id;
  const searchedQueue = Queues.getQueue(req_ocean_id);
  console.log(searchedQueue);

  if (searchedQueue) {
    searchedQueue.participants.user2_id = req_userId;
    newQueue.participants.user1_offer = null;
    newQueue.participants.user2_answer = null;
    logs.info.push(getTime(), " - Existing queue updated - ", searchedQueue)
  } else {
    const newQueue = Object.create(Queue);
    newQueue.id = uuidv4();
    newQueue.participants.user1_id = req_userId;
    newQueue.participants.user2_id = null;
    newQueue.participants.user1_offer = null;
    newQueue.participants.user2_answer = null;
    newQueue.ocean = req_ocean_id;
    Queues.addQueue(newQueue);
    logs.info.push(getTime(), " - New queue created - ", newQueue)
  }

  const res_queue_id = Queues.getQueue(req_ocean_id).id;
  res.status(200).send(JSON.stringify(res_queue_id));
});

app.get('/oceans/:oceanID', (req, res) => {
  res.sendFile(path.join(__dirname, '../src', 'room.html'));
});



//~~~~~~~~~~~~~~~~~~~~~~~~~~participants~~~~~~~~~~~~~~~~~~~~~~~~~~
// //Define only 1 Topic
// const topic1Queue = Object.create(Queue);
// topic1Queue.topic = "";
// topic1Queue.participants = [];
// Queues.addQueue(topic1Queue);

// app.get('/match', (req, res) => {
//   const the_topic = req.body.topic;
//   const the_user_id = req.body.userId;
//   Queues.getQueue(the_topic).addParticipant({
//     user_id: req.body.userId
//   });
//   const match_offer = participants.getMyMatch(the_user_id);
//   res.status(200).send(JSON.stringify(match_offer));
// });

app.get('/participants/:oceanId', (req, res) => {
  const oceanId = req.params.oceanId;
  console.log(oceanId)
  const the_queue = Queues.getQueueFromId(oceanId);
  if(the_queue){
  const res_participantsInfo = the_queue.getParticipantsInfo();
  res.status(200).send(JSON.stringify(res_participantsInfo));
  }else{
    res.status(200).send()
  }
  // console.log(res_participantsInfo);
  
});

app.put('/participants/:oceanId', (req, res) => {
  const oceanId = req.params.oceanId;
  let result;
  console.log(req.body);
  if (req.body.user1_offer) {
    console.log("Its offer");
    result = Queues.getQueueFromId(oceanId).updateParticipantsOffer(req.body);
  } else if (req.body.user2_answer) {
    console.log("Its answer");
    result = Queues.getQueueFromId(oceanId).updateParticipantsAnswer(req.body)
  } else if (req.body.connection_completed) {
    console.log("Its completed");
    result = Queues.getQueueFromId(oceanId).updateConnectionCompleted(req.body)
  }
  res.status(200).send(JSON.stringify(result));
});

app.delete('/participants/:oceanID', (req, res) => {
  const oceanId = req.params.oceanId;
  const index = Queues.elements.indexOf(Queues.getQueueFromId(oceanId));
if (index > -1) {
  Queues.elements.splice(index, 1);
}
  res.status(200).send({});
});

app.post('/match', (req, res) => {

  const the_topic = req.body.topic;
  const the_user_id = req.body.userId;
  Queues.getQueue(the_topic).addParticipant({
    user_id: req.body.userId
  });
  const the_match_id = participants.findMyMatchID(the_user_id);
  res.status(200).send(JSON.stringify(the_match_id));
});

app.put('/match/:matchId', (req, res) => {
  const matchId = req.params.matchId;
  let result;
  console.log(req.body)
  if (req.body.user1_offer) {
    console.log("Its offer");
    result = participants.updateMatchOffer(matchId, req.body);
  } else if (req.body.user2_answer) {
    console.log("Its answer");
    result = participants.updateMatchAnswer(matchId, req.body)
  } else if (req.body.connection_completed) {
    console.log("Its completed");
    result = participants.updateConnectionCompleted(matchId, req.body)
  }
  res.status(200).send(JSON.stringify(result));
});

app.delete('/match/:matchId', (req, res) => {
  const matchId = req.params.matchId;
  participants.deleteMatch(matchId);
  res.status(200).send({});
});

//todo: Separathe the signaling part from the Queue
//create an object SignalingDuo and follow their signaling, it should be like a lot of signalingDuos objects, like Queue in Queues
// After this participants connect, this duo should be deleted.
//~~~~~~~~~~~~~~~~~~~~~~~~~~Queue for a topic~~~~~~~~~~~~~~~~~~~~~~~~~~
const Queue = {
  id: '',
  ocean: '',
  participants: {
    user1_id: null,
    user1_offer: null,
    user2_id: null,
    user2_answer: null,
    connection_completed: false
  },
  addParticipant: function (new_participant) {
    const index = this.participants.findIndex((e) => e.user_id == new_participant.user_id);
    // const userExists = participants.userAlreadyMatched(new_participant.user_id);
    if (index > -1) {
      return -1;
    } else {
      this.participants.push(new_participant);
      return 0;
    }
  },
  removeParticipant: function (the_user_id) {
    const index = this.participants.findIndex((e) => e.user_id == the_user_id);
    if (index > -1) {
      this.participants.splice(index, 1);
      return 0;
    }
    return -1;
  },
  getParticipantsInfo: function () {
    if (this.participants.length == 0) {
      return 0
    } else return this.participants
  },
  updateParticipantsOffer: function (data) {
    // const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    // console.log(this.elements[index]);
    // if (index > -1) {
      this.participants.user1_offer = data.user1_offer;
      // console.log(this.elements[index])
      return 1;
    // }
    // return -1;
  },
  updateParticipantsAnswer: function (data) {
    // console.log('updating match answer')
    // const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    // if (index > -1) {
      this.participants.user2_answer = data.user2_answer;
      // console.log(this.elements[index]);
      return 1;
    // }
    // return -1;
  },
  updateParticipantsCompleted: function (the_match_id, data) {
    // const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    // console.log(this.elements[index]);
    // if (index > -1) {
      // this.participants.connection_completed = data.connection_completed;
      this.participants.user1_id = null;
      this.participants.user2_id = null;
      this.participants.connection_completed = null;
    this.participants.user1_offer = null;
    this.participants.user2_answer = null;
      // console.log(this.elements[index]);
      return 1;
      // return this.elements[index];
    // }
    // return -1;
  },
  deleteParticipants: function (the_match_id) {
    this.participants.connection_completed = null;
    this.participants.user1_offer = null;
    this.participants.user2_answer = null;
    return 1;
    // const index = this.elements.findIndex((m) => m.match_id == the_match_id);
    // if (index > -1) {
    //   const the_match = this.elements[index];
    //   this.elements.splice(index, 1);
    //   return the_match;
    // }
    // return -1;
  },
  print: function () {
    console.log("-------------------QUEUE-------------------")
    console.log(JSON.stringify(this));
  }
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~Queues for different topics~~~~~~~~~~~~~~~~~~~~~~~~~~
const Queues = {
  elements: [],
  addQueue: function (new_queue) {
    this.elements.push(new_queue);
  },
  getQueue: function (the_ocean) {
    if (this.elements.length > -1) return this.elements.find(e => e.ocean == the_ocean);
    else return -1;
  },
  getQueueFromId: function (the_id) {
    if (this.elements.length > -1) return this.elements.find(e => e.id == the_id);
    else return -1;
  },
  print: function () {
    console.log("-------------------QUEUES-------------------")
    console.log(JSON.stringify(this));
  }
}




// //~~~~~~~~~~~~~~~~~~~~~~~~~~participants~~~~~~~~~~~~~~~~~~~~~~~~~~
// const Participants = {
//   elements: [],
//   generateparticipants: function (the_topic) {
//     console.log(Queues.getQueue(the_topic))
//     if (Queues.getQueue(the_topic).participants.length == 1) {
//       return -1;
//     }
//     else {
//       while (Queues.getQueue(the_topic).participants[1]) {
//         const participant1 = Queues.getQueue(the_topic).participants[0];
//         const participant2 = Queues.getQueue(the_topic).participants[1];
//         const new_match = {
//           match_id: uuidv4(),
//           topic: the_topic,
//           user1_id: participant1.user_id,
//           user1_offer: null,
//           user2_id: participant2.user_id,
//           user2_answer: null,
//           connection_completed: false
//         }
//         console.log(new_match);
//         this.elements.push(new_match);
//         Queues.getQueue(the_topic).removeParticipant(participant1.user_id);
//         Queues.getQueue(the_topic).removeParticipant(participant2.user_id);
//       }
//     }
//   },
//   // findMyMatchID: function (the_user_id) {
//   //   console.log("find match ID for user " + the_user_id);
//   //   const index = this.elements.findIndex((m) => m.user1_id == the_user_id || m.user2_id == the_user_id);
//   //   if (index > -1) {
//   //     return this.elements[index].match_id;
//   //   } else return 'no match';
//   // },
//   getParticipantInfo: function (the_participant) {
//     const index = this.elements.findIndex((m) => m.match_id == the_match_id);
//     if (index > -1) {
//       return this.elements[index];
//     }
//     return -1;
//   },
//   updateMatchOffer: function (data) {
//     const index = this.elements.findIndex((m) => m.match_id == the_match_id);
//     console.log(this.elements[index]);
//     if (index > -1) {
//       this.elements[index].user1_offer = data.user1_offer;
//       console.log(this.elements[index])
//       return this.elements[index];
//     }
//     return -1;
//   },
//   updateMatchAnswer: function (the_match_id, data) {
//     console.log('updating match answer')
//     const index = this.elements.findIndex((m) => m.match_id == the_match_id);
//     if (index > -1) {
//       this.elements[index].user2_answer = data.user2_answer;
//       console.log(this.elements[index]);
//       return this.elements[index];
//     }
//     return -1;
//   },
//   updateConnectionCompleted: function (the_match_id, data) {
//     const index = this.elements.findIndex((m) => m.match_id == the_match_id);
//     console.log(this.elements[index]);
//     if (index > -1) {
//       this.elements[index].connection_completed = data.connection_completed;
//       console.log(this.elements[index]);
//       return this.elements[index];
//     }
//     return -1;
//   },
//   deleteMatch: function (the_match_id) {
//     const index = this.elements.findIndex((m) => m.match_id == the_match_id);
//     if (index > -1) {
//       const the_match = this.elements[index];
//       this.elements.splice(index, 1);
//       return the_match;
//     }
//     return -1;
//   },
//   userAlreadyMatched: function (the_user_id) {
//     const index = this.elements.findIndex((m) => m.user1_id == the_user_id || m.user2_id == the_user_id);
//     if (index > -1) {
//       return true;
//     } else return false;
//   },
//   print: function () {
//     console.log("-------------------participants-------------------");
//     console.log(JSON.stringify(this));
//   }
// };

// //Constantly generate participants for a topic
// function constantlyGenerateparticipants(the_topic) {
//   setTimeout(function () {
//     participants.generateparticipants(the_topic);
//     constantlyGenerateparticipants(the_topic);
//   }, 5000);
// }
// //Start generation participants for Topic 1
// constantlyGenerateparticipants('Topic1');

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

