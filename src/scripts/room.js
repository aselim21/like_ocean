// const serverURL_oceans = 'http://localhost:3000';
const serverURL_oceans = 'https://ocean-ag.herokuapp.com';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append("Access-Control-Allow-Credentials", "true");
headers.append("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials, Cookie, Set-Cookie, Authorization');
headers.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
const the_ocean_id = window.location.pathname.slice(8);
console.log(the_ocean_id);
const the_userId = window.localStorage.fish_id;
const configuration = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
}
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
const stop_btn = document.getElementById('js-stop-btn');

let peerConnection = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });

//Monitor the state of the Peer Connection
peerConnection.onconnectionstatechange = function (event) {
    console.log('State changed ' + peerConnection.connectionState);
}

//try to connect to the user
setTimeout(() => {
    if (peerConnection.connectionState != 'connected') {
        alert("Your match left.");
        deleteParticipantsInfo();
        closeVideoCall();
    }
    // 30 seconds
}, 18880000);
stop_btn.addEventListener("click", async (e) => {
    deleteParticipantsInfo();
    closeVideoCall();
});
//Duraion of the Call
// setTimeout(() => {
//     closeVideoCall();
//     //1minute
// }, 108000);

// const finish_call_btn = document.getElementById('js-finish-call');
// finish_call_btn.addEventListener("click", async (e) => {
//     deleteMatchInfo_req();
//     closeVideoCall();
// });

let dataChannel;

const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');

//Event-Listeners for the videos
localVideo.addEventListener('loadedmetadata', function () {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('loadedmetadata', function () {
    console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});


//1. First start sharing media

async function startMediaSharing() {

    const mediaConstraints_toSend = { audio: true, video: true };
    const mediaConstraints_toDisplay = { audio: false, video: true };

    let localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints_toSend);
    let localStream_toDisplay = await navigator.mediaDevices.getUserMedia(mediaConstraints_toDisplay);
    let remoteStream = new MediaStream();

    localStream.getTracks().forEach((track) => {
        console.log("tracks sent");
        peerConnection.addTrack(track, localStream);
    });
    localVideo.srcObject = localStream_toDisplay;

    peerConnection.ontrack = function (event) {
        console.log('track received');
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        })
        remoteVideo.srcObject = remoteStream;
    }
}
await startMediaSharing();



//--------------------------------------------------------------------------------------
const participantsInfo = await getParticipantsInfo();

console.log(participantsInfo)
if (the_userId == participantsInfo.user1_id) {
    console.log('Its user 1');
    await createOffer_user1(updateParticipantsInfo);
    processAnswerWhenReady_user1();
}

if (the_userId == participantsInfo.user2_id) {
    console.log('its user 2')
    processOfferWhenReady_user2();
}

//WebRTC Functions
//~~~~~~~~~~~refactored~~~~~~~~~~~
async function createOffer_user1(callback) {
    console.log("in createOffer_user1")
    dataChannel = peerConnection.createDataChannel('channel1');
    dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    dataChannel.onopen = e => console.log('Connection opened');
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
    };
    setTimeout(() => {
        console.log('PUT OFFER');
        callback({ user1_offer: peerConnection.localDescription });
    }, 2000)
    const offer = await peerConnection.createOffer(offerOptions);
    await peerConnection.setLocalDescription(offer);
    return offer;
}
//~~~~~~~~~~~refactored~~~~~~~~~~~
async function processAnswerWhenReady_user1() {
    console.log('in processAnswerWhenReady_user1');
    setTimeout(async function () {
        const matchInfo = await getParticipantsInfo();
        const user2_answer = matchInfo.user2_answer;
        if (user2_answer) {
            const remoteDesc = new RTCSessionDescription(user2_answer);
            await peerConnection.setRemoteDescription(remoteDesc);
            // await deleteMatchInfo_req();
            return 0;
        } else {

            console.log('staring processAnswerWhenReady_user1 again')
            await processAnswerWhenReady_user1()

        }
    }, 1000)
    return -1;
}
//~~~~~~~~~~~refactored~~~~~~~~~~~
async function processOfferWhenReady_user2() {
    console.log('in processOfferWhenReady_user2');
    setTimeout(async function () {
        const matchInfo = await getParticipantsInfo();
        const user1_offer = matchInfo.user1_offer;
        const user2_answer = matchInfo.user2_answer;
        if (user1_offer && !user2_answer) {
            await createAnswerAndConnect_user2(user1_offer, updateParticipantsInfo);
            return 0;
        } else {
            console.log('staring processOfferWhenReady_user2 again')
            await processOfferWhenReady_user2()
        }
    }, 1000)
    return -1;

}

async function createAnswerAndConnect_user2(offer, callback) {
    peerConnection.addEventListener('datachannel', event => {
        dataChannel = event.channel;
        dataChannel.onopen = e => console.log('Connection opened');
        dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    });
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        setTimeout(() => {
            console.log("PUT ANSWER");
            callback({ user2_answer: peerConnection.localDescription });
        }, 2000)
    };
    const remoteDesc = new RTCSessionDescription(offer);
    await peerConnection.setRemoteDescription(remoteDesc);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
}


//Requests
async function getParticipantsInfo() {
    const response = await fetch(`${serverURL_oceans}/participants/${the_ocean_id}`, {
        method: 'GET'
    });
    console.log(response);
    console.log(response.json());//test//tests
    return response;
}
async function updateParticipantsInfo(data) {
    const response = await fetch(`${serverURL_oceans}/participants/${the_ocean_id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data)
    });
    return response.json();
};

async function deleteParticipantsInfo() {
    const response = await fetch(`${serverURL_oceans}/oceans`, {
        method: 'DELETE',
        headers: headers,
    });
    return response.json();
};


function closeVideoCall() {
    console.log('++++++video closed');

    if (peerConnection) {
        peerConnection.ontrack = null;
        peerConnection.onremovetrack = null;
        peerConnection.onremovestream = null;
        peerConnection.onicecandidate = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.onsignalingstatechange = null;
        peerConnection.onicegatheringstatechange = null;
        peerConnection.onnegotiationneeded = null;

        if (remoteVideo.srcObject) {
            remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        }

        if (localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
        }

        alert('Call ended.');
        peerConnection.close();
        peerConnection = null;
    }
}