// const socket_URL = 'ws://localhost:8080';
const socket_URL = 'wss://ocean-ag.herokuapp.com';
let socket = new WebSocket(socket_URL);
const the_oceanID = getCookie('oceanID');
const the_fishID = window.localStorage.fish_id;

let PEER_CONNECTIONS = [];
let PeerCon_COUNTER = 0;
let DATA_CHANNELS = [];
const configuration = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
}
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

let messageBox = document.getElementById('js-message-box');
const end_btn = document.getElementById('js-end-btn');
const localVideo_btn = document.getElementById('js-local-fullscreen');
const localVideoDIV = document.getElementById('localVideoDIV');
const localVideo = document.getElementById('webcamVideo');

//Event Listeners
end_btn.addEventListener("click", async (e) => {
    const data = {
        type: 'endCall',
        _oceanID: the_oceanID
    }
    socket.send(JSON.stringify(data));
});
localVideo_btn.addEventListener("click", async (e) => {
    openFullscreen(localVideoDIV);
});
localVideo.addEventListener('loadedmetadata', function () {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

//Helping Fucntions
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
function disconnectedFishCleanScreen(_name){
    // const remoteVideo = document.querySelector(`video[pair="${_name}"]`);
    const remoteVideoDIV = document.querySelector(`div[pair="${_name}"]`);
    const remoteVideo_btn = document.querySelector(`button[pair="${_name}"]`);
    remoteVideoDIV.remove();
    remoteVideo_btn.remove();
}
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

    const videosCluster = document.getElementById("videos");
    videosCluster.insertBefore(remoteVideo_btn, videosCluster.children[0]);
    videosCluster.insertBefore(remoteVideoDIV, videosCluster.children[0]);
}




//SOCKET FUCNTIONS
socket.addEventListener('open', function (event) {
    const data = {
        type: 'StartSignaling',
        _fishID: the_fishID,
        _oceanID: the_oceanID
    }
    socket.send(JSON.stringify(data));

    socket.addEventListener('message', async function (event) {
        console.log('Message from server ');
        
        let _data;
        try {
            _data = JSON.parse(event.data);
        } catch (error) {
            console.log('Error of JSON.Parse')
        }
        console.log(_data);
        if (_data.type == 0 || _data.type == 1) {
            messageBox.innerHTML = _data.message;
        } else
            if (_data.type == 'OceanInfoUpdated') {
                const oceanPairs = _data.message;
                // fist check the Connection Number 
                updatePeerCon_COUNTER(oceanPairs).then(async function (_newPeerCOUNTER){
                    for (const p of oceanPairs) {
                        if (p.f1 == the_fishID && p.connected == false) {
                            
                            const new_connection_name = p.f1 + '-' + p.f2;
                            console.log(`New Connection name: ${new_connection_name}`);
                            messageBox.innerHTML = `New Connection name: ${new_connection_name}. Will send an offer.`;
                            console.log("Will send offer to ", p.f2);
                            await createPeerCon(new_connection_name, _newPeerCOUNTER);
                            await startMediaSharing(new_connection_name, _newPeerCOUNTER);
                            await createDataChn(new_connection_name, _newPeerCOUNTER);
                            await createOffer_user1(_newPeerCOUNTER);         
                            return false;
                        }if(p.f1 != the_fishID && p.connected == false){
                            return false;
                        }      
                    }
                })
            } else
                if (_data.type == 'f1_offer') {
                    const currentPeerCOUNTER = PeerCon_COUNTER;
                    //Im user 2
                    let new_connection_name = _data._f1 + '-' + _data._f2;
                    console.log(`Received an offer from: ${new_connection_name}`);
                    messageBox.innerHTML = `Received an offer from: ${new_connection_name}`;
                    await createPeerCon(new_connection_name, currentPeerCOUNTER);
                    await startMediaSharing(new_connection_name, currentPeerCOUNTER);
                    await createAnswerAndConnect_user2(_data._offer, _data._f1, currentPeerCOUNTER);
                } else
                    if (_data.type == 'f2_answer') {
                        //Im user 1
                        let new_connection_name = _data._f1 + '-' + _data._f2;
                        console.log("Received an answer from: ", _data._f2);
                        messageBox.innerHTML = `Received an answer from: ${new_connection_name}`;
                        const currentPeerCOUNTER = PeerCon_COUNTER;
                        await processAnswerWhenReady_user1(_data._answer, _data._f2, currentPeerCOUNTER);
                    }
    });
});



//Web Socket Functions
async function createPeerCon(_name, _PeerCOUNTER) {
    PEER_CONNECTIONS[_PeerCOUNTER] = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });
    PEER_CONNECTIONS[_PeerCOUNTER].onconnectionstatechange = function (event) {
        document.getElementById('js-message-box').innerHTML = 'State changed of: ' + _name + ' = ' + PEER_CONNECTIONS[_PeerCOUNTER].connectionState;
        console.log('State changed of: ' + _name + ' = ' + PEER_CONNECTIONS[_PeerCOUNTER].connectionState);
        if(PEER_CONNECTIONS[_PeerCOUNTER].connectionState == 'disconnected'){
            disconnectedFishCleanScreen(_name);
        }
    }
    PEER_CONNECTIONS[_PeerCOUNTER].oniceconnectionstatechange = function(){
       console.log('New ICE state: ', PEER_CONNECTIONS[_PeerCOUNTER].iceConnectionState);
    }
}

async function createDataChn(_name, _PeerCOUNTER) {
    DATA_CHANNELS[_PeerCOUNTER] = PEER_CONNECTIONS[_PeerCOUNTER].createDataChannel(_name);
    DATA_CHANNELS[_PeerCOUNTER].onmessage = e => console.log('Got a message: ' + e.data);
    DATA_CHANNELS[_PeerCOUNTER].onopen = e => console.log('Connection opened');
    PEER_CONNECTIONS[_PeerCOUNTER].onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
    };
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
        resolve(PeerCon_COUNTER);
    }
    })
}

async function startMediaSharing(_name, _PeerCOUNTER) {
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
        console.log(`Remote video video Width: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
    });

    localStream.getTracks().forEach((track) => {
        console.log("tracks sent");
        PEER_CONNECTIONS[_PeerCOUNTER].addTrack(track, localStream);
    });
    localVideo.srcObject = localStream_toDisplay;

        PEER_CONNECTIONS[_PeerCOUNTER].ontrack = function (event) {
            console.log('track received');
            event.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track);
            })
            console.log(remoteVideo);
            remoteVideo.srcObject = remoteStream;
        }
}

async function createOffer_user1(_PeerCOUNTER) {
    const offer = await PEER_CONNECTIONS[_PeerCOUNTER].createOffer(offerOptions);
    await PEER_CONNECTIONS[_PeerCOUNTER].setLocalDescription(offer);
    setTimeout(() => {
        console.log('PUT OFFER');
        const data = {
            type: 'f1_offer',
            _fishID: the_fishID,
            _oceanID: the_oceanID,
            _offer: PEER_CONNECTIONS[_PeerCOUNTER].localDescription,
            _f1: the_fishID
        }
        socket.send(JSON.stringify(data));
    }, 2000)
}

async function createAnswerAndConnect_user2(_offer, _f1, _PeerCOUNTER) {
    PEER_CONNECTIONS[_PeerCOUNTER].addEventListener('datachannel', event => {
        DATA_CHANNELS[_PeerCOUNTER] = event.channel;
        DATA_CHANNELS[_PeerCOUNTER].onopen = e => console.log('Connection opened from datachannel: ', event.channel.label);
        DATA_CHANNELS[_PeerCOUNTER].onmessage = e => console.log('Got a message: ' + e.data);
    });
    PEER_CONNECTIONS[_PeerCOUNTER].onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        setTimeout(() => {
            console.log("PUT ANSWER");
            const data = {
                type: 'f2_answer',
                _fishID: the_fishID,
                _oceanID: the_oceanID,
                _answer: PEER_CONNECTIONS[_PeerCOUNTER].localDescription,
                _f1: _f1,
                _f2: the_fishID
            }
            socket.send(JSON.stringify(data));
        }, 3000)
    };
    const remoteDesc = new RTCSessionDescription(_offer);
    await PEER_CONNECTIONS[_PeerCOUNTER].setRemoteDescription(remoteDesc);
    const answer = await PEER_CONNECTIONS[_PeerCOUNTER].createAnswer();
    await PEER_CONNECTIONS[_PeerCOUNTER].setLocalDescription(answer);
}

async function processAnswerWhenReady_user1(_answer, _f2, _PeerCOUNTER) {
    const remoteDesc = new RTCSessionDescription(_answer);
    await PEER_CONNECTIONS[_PeerCOUNTER].setRemoteDescription(remoteDesc);
    console.log('ACCEPT ANSWER');
    const data = {
        type: 'f1_connected',
        _fishID: the_fishID,
        _oceanID: the_oceanID,
        _f1: the_fishID,
        _f2: _f2
    }
    socket.send(JSON.stringify(data));
}

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