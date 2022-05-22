// const socket_URL = 'ws://localhost:8080';
const socket_URL = 'wss://ocean-ag.herokuapp.com';
let socket = new WebSocket(socket_URL);
const the_oceanID = getCookie('oceanID');
const the_fishID = window.localStorage.fish_id;
let messageBox = document.getElementById('js-message-box');
const end_btn = document.getElementById('js-end-btn');
end_btn.addEventListener("click", async (e) => {
    const data = {
        type: 'endCall',
        _oceanID: the_oceanID
    }
    socket.send(JSON.stringify(data));
});

//fullscreen

/* When the openFullscreen() function is executed, open the video in fullscreen.
Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
function openFullscreen(_elem) {
    if (_elem.requestFullscreen) {
        _elem.requestFullscreen();
    } else if (_elem.mozRequestFullScreen) {
        _elem.mozRequestFullScreen();
    } else if (_elem.webkitRequestFullscreen) {
        _elem.webkitRequestFullscreen();
    } else if (_elem.msRequestFullscreen) {
        _elem.msRequestFullscreen();
    }
}

// const remoteVideo_btn = document.getElementById('js-remote-fullscreen');
const localVideo_btn = document.getElementById('js-local-fullscreen');
const localVideoDIV = document.getElementById('localVideoDIV');
// const remoteVideoDIC = document.getElementById('remoteVideoDIV');
// remoteVideo_btn.addEventListener("click", async (e) => {
//     openFullscreen(remoteVideoDIC);
// });
localVideo_btn.addEventListener("click", async (e) => {
    openFullscreen(localVideoDIV);
});


//SOCKET FUCNTIONS
let oceanInfo;
socket.addEventListener('open', function (event) {
    const data = {
        type: 'StartSignaling',
        _fishID: the_fishID,
        _oceanID: the_oceanID
    }
    socket.send(JSON.stringify(data));


    socket.addEventListener('message', async function (event) {
        console.log('Message from server ');
        // console.log(JSON.parse(event.data));
        let _data;
        try {
            _data = JSON.parse(event.data);
        } catch (error) {
            console.log('PROBLEM!!!! with PARSE')
        }
        console.log(_data)

        if (_data.type == 0 || _data.type == 1) {
            messageBox.innerHTML = _data.message;
        } else
            // if (_data.type == 'OceanInfo') {
            //     oceanInfo = _data.message;
            //     //search if i am user 1, send the second users offer
            //     if (oceanInfo.fishPairs.length > 0 && oceanInfo.fishPairs.length != 2) {
            //         // just send the offerOptions, the server will decide who to send it to
            //         dataChannel = peerConnection.createDataChannel('channel1');//can need more names
            //         dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
            //         dataChannel.onopen = e => console.log('Connection opened');
            //         peerConnection.onicecandidate = function (e) {
            //             console.log("ICE candidate (peerConnection)", e);
            //         };
            //         setTimeout(() => {
            //             console.log('PUT OFFER');
            //             const data = {
            //                 type : 'f1_offer',
            //                 _offer:peerConnection.localDescription
            //             }
            //             socket.send(JSON.stringify(data));
            //         }, 2000)
            //         const offer = await peerConnection.createOffer(offerOptions);
            //         await peerConnection.setLocalDescription(offer);
            //     }

            // }else 
            if (_data.type == 'OceanInfoUpdated') {
                const oceanPairs = _data.message;
                // fist check the Connection Number 
                updatePeerCon_COUNTER(oceanPairs).then(async function (){
                    console.log('in theafter');
                    for (const p of oceanPairs) {
                        console.log('started');
                        if (p.f1 == the_fishID && p.connected == false) {
                            console.log("Should send an OFFER")
                            const new_connection_name = p.f1 + '-' + p.f2;
                            await createPeerCon(new_connection_name);
                            await startMediaSharing(new_connection_name);
                            await createDataChn(new_connection_name);
                            await createOffer_user1();         
                            return false;
                        }if(p.f1 != the_fishID && p.connected == false){
                            //wait the next update
                            return false;
                        }
                        // else if(p.f2 == the_fishID && p.connected == false){
                        //     const new_connection_name = p.f1 + '-' + p.f2;
                        //     createPeerCon(new_connection_name);
                        //     await startMediaSharing(new_connection_name);
                        //     console.log('i should wait for connection');
                        // }
                        console.log('in the continue');
                        // return true;
                    }
                   
                })

                // oceanPairs.every(p => {
                //     if (p.f1 == the_fishID && p.connected == false) {
                //         console.log("Should send an OFFER")
                //         let new_connection_name = p.f1 + '-' + p.f2;
                //         createPeerCon(new_connection_name);
                //         createDataChn(new_connection_name);
                //         await startMediaSharing(new_connection_name);
                //         createOffer_user1();
                //         return false;
                //     }
                //     return true;
                // })

            } else
                if (_data.type == 'f1_offer') {
                    //Im user 2
                    //also create a PeerCon
                    let new_connection_name = _data._f1 + '-' + _data._f2;
                    console.log(`New Connection name: ${new_connection_name}`);
                    await createPeerCon(new_connection_name);
                    await startMediaSharing(new_connection_name);
                    await createAnswerAndConnect_user2(_data._offer, _data._f1);
                } else
                    if (_data.type == 'f2_answer') {
                        //Im user 1
                        await processAnswerWhenReady_user1(_data._answer, _data._f2);

                    }




    });
});

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


const configuration = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
}
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

let PEER_CONNECTIONS = [];
let PeerCon_COUNTER = 0;
let DATA_CHANNELS = [];

async function createPeerCon(_name) {
console.log('==============creating Offer=================')
    PEER_CONNECTIONS[PeerCon_COUNTER] = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });
    PEER_CONNECTIONS[PeerCon_COUNTER].onconnectionstatechange = function (event) {
        document.getElementById('js-message-box').innerHTML = 'State changed of: ' + _name + ' = ' + PEER_CONNECTIONS[PeerCon_COUNTER].connectionState;
        console.log('State changed of: ' + _name + ' = ' + PEER_CONNECTIONS[PeerCon_COUNTER].connectionState);
    }
    PEER_CONNECTIONS[PeerCon_COUNTER].oniceconnectionstatechange = function(){
       console.log('==============ICE state: ', PEER_CONNECTIONS[PeerCon_COUNTER].iceConnectionState);
    }
    // PEER_CONNECTIONS[PeerCon_COUNTER] = peerConnection;
    
}

async function createDataChn(_name) {
    DATA_CHANNELS[PeerCon_COUNTER] = PEER_CONNECTIONS[PeerCon_COUNTER].createDataChannel(_name);
    DATA_CHANNELS[PeerCon_COUNTER].onmessage = e => console.log('Got a message: ' + e.data);
    DATA_CHANNELS[PeerCon_COUNTER].onopen = e => console.log('Connection opened');
    PEER_CONNECTIONS[PeerCon_COUNTER].onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
    };
    // DATA_CHANNELS[PeerCon_COUNTER] = dataChannel;
}

async function updatePeerCon_COUNTER(_pairs) {
    return new Promise(function (resolve, reject) {
        let connectionsCounter = 0;
    _pairs.forEach(p => {
        if ((p.f1 == the_fishID || p.f2 == the_fishID) && p.connected == true)
            connectionsCounter++;
    })
    const newDoneConnections = connectionsCounter - PeerCon_COUNTER;
    PeerCon_COUNTER += newDoneConnections;
    if (newDoneConnections > 1) {
        messageBox.innerHTML = "Something went wrong with your connections."
        reject(newDoneConnections);
    }else {
        console.log('NEW PEERCOUNTER = ',PeerCon_COUNTER );
        resolve(newDoneConnections);
    }
    })
    
}

// let peerConnection = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });

//Monitor the state of the Peer Connection
// peerConnection.onconnectionstatechange = function (event) {
//     document.getElementById('js-message-box').innerHTML = 'State changed ' + peerConnection.connectionState;
//     console.log('State changed ' + peerConnection.connectionState);
// }
// let dataChannel;


// const finish_call_btn = document.getElementById('js-finish-call');
// finish_call_btn.addEventListener("click", async (e) => {
//     deleteMatchInfo_req();
//     closeVideoCall();
// });



const localVideo = document.getElementById('webcamVideo');
// const remoteVideo = document.getElementById('TEST');

//Event-Listeners for the videos
localVideo.addEventListener('loadedmetadata', function () {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

// remoteVideo.addEventListener('loadedmetadata', function () {
//     console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
// });


//1. First start sharing media
async function createRemoteVideoElement(_name) {
    const remoteVideoDIV = document.createElement('div');
    remoteVideoDIV.setAttribute('pair', _name);
    remoteVideoDIV.setAttribute('class', 'remoteVideoDIV');
    const remoteVideo = document.createElement('video');
    remoteVideo.setAttribute('pair', _name);
    remoteVideo.setAttribute('class', 'remoteVideo');
    remoteVideo.setAttribute('autoplay','');
    const remoteVideo_btn = document.createElement('button');
    remoteVideo_btn.setAttribute('pair', _name);
    remoteVideo_btn.setAttribute('class', 'js-remote-fullscreen');
    remoteVideo_btn.innerHTML = "Remote Video Full Screen";

    remoteVideoDIV.appendChild(remoteVideo);
    remoteVideoDIV.appendChild(remoteVideo_btn);

    const videosCluster = document.getElementById("videos");
    // videosCluster.insertBefore(remoteVideoDIV, videosCluster.children[0]);
    videosCluster.insertBefore(remoteVideoDIV, videosCluster.children[0]);
}
async function startMediaSharing(_name) {
    if(!document.querySelector('video[pair="404247-4832758"]')){
        await createRemoteVideoElement(_name);
    }
    
    const remoteVideo = document.querySelector(`video[pair="${_name}"]`);
    const remoteVideoDIV = document.querySelector(`div[pair="${_name}"]`);
    const remoteVideo_btn = document.querySelector(`button[pair="${_name}"]`);
    const mediaConstraints_toSend = { audio: true, video: true };
    const mediaConstraints_toDisplay = { audio: false, video: true };

    let localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints_toSend);
    let localStream_toDisplay = await navigator.mediaDevices.getUserMedia(mediaConstraints_toDisplay);
    let remoteStream = new MediaStream();
    
    remoteVideo_btn.addEventListener("click", async (e) => {
        openFullscreen(remoteVideoDIV);
    });
    remoteVideo.addEventListener('loadedmetadata', function () {
        console.log(`=============Remote video video Width: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
    });

    localStream.getTracks().forEach((track) => {
        console.log("tracks sent");
        PEER_CONNECTIONS[PeerCon_COUNTER].addTrack(track, localStream);
    });
    localVideo.srcObject = localStream_toDisplay;

        PEER_CONNECTIONS[PeerCon_COUNTER].ontrack = function (event) {
            console.log('track received');
            event.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track);
            })
            console.log(remoteVideo);
            remoteVideo.srcObject = remoteStream;
            // remoteVideoTEST.srcObject = remoteStream;
    
        }
    

    // navigator.mediaDevices.getUserMedia(constraints)
    // .then(function(mediaStream) {
    //   var video = document.querySelector('video');
    //   video.srcObject = mediaStream;
    //   video.onloadedmetadata = function(e) {
    //     video.play();
    //   };
    // })
}
// const localVideo = document.getElementById('webcamVideo');
// // const remoteVideo = document.getElementById('remoteVideo');

// //Event-Listeners for the videos
// localVideo.addEventListener('loadedmetadata', function () {
//     console.log(`=============Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
// });

// const mediaConstraints_toDisplay = { audio: false, video: true };

// let localStream_toDisplay = await navigator.mediaDevices.getUserMedia(mediaConstraints_toDisplay);
// localVideo.srcObject = localStream_toDisplay;


//NEW MEDIA SHARE FUNC
// async function startMediaSharing(_name) {
//     const localVideo = document.getElementById('webcamVideo');

// localVideo.addEventListener('loadedmetadata', function () {
//     console.log(`=============Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
// });

// const mediaConstraints_toDisplay = { audio: false, video: true };

// let localStream_toDisplay = await navigator.mediaDevices.getUserMedia(mediaConstraints_toDisplay);
// localVideo.srcObject = localStream_toDisplay;
//     const mediaConstraints_toSend = { audio: true, video: true };
//     let localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints_toSend);
//     let remoteStream = new MediaStream();

//     localStream.getTracks().forEach((track) => {
//         console.log("=============tracks sent=============");
//         PEER_CONNECTIONS[PeerCon_COUNTER].addTrack(track, localStream);
//     });
//     //create the remote video element
//     const remoteVideoDIV = document.createElement('div');
//     remoteVideoDIV.setAttribute('class', 'remoteVideoDIV');
//     const remoteVideo = document.createElement('video');
//     remoteVideo.setAttribute('id', _name);
//     remoteVideo.setAttribute('class', 'remoteVideo');
//     const remoteVideo_btn = document.createElement('button');
//     remoteVideo_btn.setAttribute('id', _name);
//     remoteVideo_btn.setAttribute('class', 'js-remote-fullscreen');
//     remoteVideo_btn.innerHTML = "Remote Video Full Screen";
//     remoteVideo_btn.addEventListener("click", async (e) => {
//         openFullscreen(remoteVideoDIV);
//     });
//     remoteVideo.addEventListener('loadedmetadata', function () {
//         console.log(`=============Remote video video Width: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
//     });

//     remoteVideoDIV.appendChild(remoteVideo);
//     remoteVideoDIV.appendChild(remoteVideo_btn);

//     const videosCluster = document.getElementById("videos");
//     videosCluster.insertBefore(remoteVideoDIV, videosCluster.children[0]);

//     PEER_CONNECTIONS[PeerCon_COUNTER].ontrack = function (event) {
//         console.log('=============track received=============');
//         event.streams[0].getTracks().forEach(track => {
//             remoteStream.addTrack(track);
//         })
//         document.getElementById(_name).srcObject = remoteStream;
//     }
// }

//--------------------------------------------------------------------------------------
// const participantsInfo = await getParticipantsInfo();

// console.log(participantsInfo)
// if (the_userId == participantsInfo.user1_id) {
//     console.log('Its user 1');
//     await createOffer_user1(updateParticipantsInfo);
//     processAnswerWhenReady_user1();
// }

// if (the_userId == participantsInfo.user2_id) {
//     console.log('its user 2')
//     processOfferWhenReady_user2();
// }

// //WebRTC Functions
// //~~~~~~~~~~~refactored~~~~~~~~~~~
// async function createOffer_user1(_channelName) {

//     //should create a new peer connection, new data channel with the peer information
//     console.log("in createOffer_user1")
//     dataChannel = peerConnection.createDataChannel('channel1');
//     dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
//     dataChannel.onopen = e => console.log('Connection opened');
//     peerConnection.onicecandidate = function (e) {
//         console.log("ICE candidate (peerConnection)", e);
//     };
//     const offer = await peerConnection.createOffer(offerOptions);
//     await peerConnection.setLocalDescription(offer);
//     setTimeout(() => {
//         console.log('PUT OFFER');
//         const data = {
//             type: 'f1_offer',
//             _fishID: the_fishID,
//             _oceanID: the_oceanID,
//             _offer: peerConnection.localDescription,
//             _f1: the_fishID
//         }
//         socket.send(JSON.stringify(data));
//     }, 2000)
// }

async function createOffer_user1(_channelName) {

    //should create a new peer connection, new data channel with the peer information
    console.log("in createOffer_user1")

    const offer = await PEER_CONNECTIONS[PeerCon_COUNTER].createOffer(offerOptions);
    await PEER_CONNECTIONS[PeerCon_COUNTER].setLocalDescription(offer);
    setTimeout(() => {
        console.log('PUT OFFER');
        const data = {
            type: 'f1_offer',
            _fishID: the_fishID,
            _oceanID: the_oceanID,
            _offer: PEER_CONNECTIONS[PeerCon_COUNTER].localDescription,
            _f1: the_fishID
        }
        socket.send(JSON.stringify(data));
    }, 2000)
}

// async function createAnswerAndConnect_user2(_offer, _f1) {
//     peerConnection.addEventListener('datachannel', event => {
//         dataChannel = event.channel;
//         dataChannel.onopen = e => console.log('Connection opened');
//         dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
//     });
//     peerConnection.onicecandidate = function (e) {
//         console.log("ICE candidate (peerConnection)", e);
//         setTimeout(() => {
//             console.log("PUT ANSWER");
//             const data = {
//                 type: 'f2_answer',
//                 _fishID: the_fishID,
//                 _oceanID: the_oceanID,
//                 _answer: peerConnection.localDescription,
//                 _f1: _f1,
//                 _f2: the_fishID
//             }
//             socket.send(JSON.stringify(data));
//             // user2_answer: peerConnection.localDescription
//         }, 2000)
//     };
//     const remoteDesc = new RTCSessionDescription(_offer);
//     await peerConnection.setRemoteDescription(remoteDesc);
//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
// }


async function createAnswerAndConnect_user2(_offer, _f1) {
    PEER_CONNECTIONS[PeerCon_COUNTER].addEventListener('datachannel', event => {
        DATA_CHANNELS[PeerCon_COUNTER] = event.channel;
        DATA_CHANNELS[PeerCon_COUNTER].onopen = e => console.log('Connection opened from datachannel: ', event.channel.label);
        DATA_CHANNELS[PeerCon_COUNTER].onmessage = e => console.log('Got a message: ' + e.data);
    });
    PEER_CONNECTIONS[PeerCon_COUNTER].onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        setTimeout(() => {
            console.log("PUT ANSWER");
            const data = {
                type: 'f2_answer',
                _fishID: the_fishID,
                _oceanID: the_oceanID,
                _answer: PEER_CONNECTIONS[PeerCon_COUNTER].localDescription,
                _f1: _f1,
                _f2: the_fishID
            }
            socket.send(JSON.stringify(data));
            // user2_answer: peerConnection.localDescription
        }, 3000)
    };
    const remoteDesc = new RTCSessionDescription(_offer);
    await PEER_CONNECTIONS[PeerCon_COUNTER].setRemoteDescription(remoteDesc);
    const answer = await PEER_CONNECTIONS[PeerCon_COUNTER].createAnswer();
    await PEER_CONNECTIONS[PeerCon_COUNTER].setLocalDescription(answer);

    //READY FOR NEW CONNECTION
    // PeerCon_COUNTER++;
}
// //~~~~~~~~~~~refactored~~~~~~~~~~~
async function processAnswerWhenReady_user1(_answer, _f2) {
    console.log('in processAnswerWhenReady_user1');
    const remoteDesc = new RTCSessionDescription(_answer);
    await PEER_CONNECTIONS[PeerCon_COUNTER].setRemoteDescription(remoteDesc);
    console.log('ACCEPT ANSWER');
    const data = {
        type: 'f1_connected',
        _fishID: the_fishID,
        _oceanID: the_oceanID,
        _f1: the_fishID,
        _f2: _f2
    }
    socket.send(JSON.stringify(data));

    //READY FOR NEW CONNECTION
    // PeerCon_COUNTER++;
}
// //~~~~~~~~~~~refactored~~~~~~~~~~~
// async function processOfferWhenReady_user2() {
//     console.log('in processOfferWhenReady_user2');
//     setTimeout(async function () {
//         const matchInfo = await getParticipantsInfo();
//         console.log(matchInfo);
//         const user1_offer = matchInfo.user1_offer;
//         const user2_answer = matchInfo.user2_answer;
//         if (user1_offer && !user2_answer) {
//             await createAnswerAndConnect_user2(user1_offer, updateParticipantsInfo);
//             return 0;
//         } else {
//             console.log('staring processOfferWhenReady_user2 again')
//             await processOfferWhenReady_user2()
//         }
//     }, 1000)
//     return -1;

// }




// //Requests
// async function getParticipantsInfo() {
//     const response = await fetch(`${serverURL_oceans}/participants/${the_ocean_id}`, {
//         method: 'GET',
//         headers: headers
//     });
//     // console.log(response);
//     // console.log(response.json());//test//tests
//     return response.json();
// }
// async function updateParticipantsInfo(data) {
//     const response = await fetch(`${serverURL_oceans}/participants/${the_ocean_id}`, {
//         method: 'PUT',
//         headers: headers,
//         body: JSON.stringify(data)
//     });
//     return response.json();
// };

// async function deleteParticipantsInfo() {
//     const response = await fetch(`${serverURL_oceans}/oceans`, {
//         method: 'DELETE',
//         headers: headers,
//     });
//     return response.json();
// };


// function closeVideoCall() {
//     console.log('++++++video closed');

//     if (peerConnection) {
//         peerConnection.ontrack = null;
//         peerConnection.onremovetrack = null;
//         peerConnection.onremovestream = null;
//         peerConnection.onicecandidate = null;
//         peerConnection.oniceconnectionstatechange = null;
//         peerConnection.onsignalingstatechange = null;
//         peerConnection.onicegatheringstatechange = null;
//         peerConnection.onnegotiationneeded = null;

//         if (remoteVideo.srcObject) {
//             remoteVideo.srcObject.getTracks().forEach(track => track.stop());
//         }

//         if (localVideo.srcObject) {
//             localVideo.srcObject.getTracks().forEach(track => track.stop());
//         }

//         alert('Call ended.');
//         peerConnection.close();
//         peerConnection = null;
//     }
// }