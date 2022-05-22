// const socket_URL = 'ws://localhost:8080';
const socket_URL = 'wss://ocean-ag.herokuapp.com';
let socket = new WebSocket(socket_URL);
const the_oceanID = getCookie('oceanID');
const the_fishID = window.localStorage.fish_id;

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

const remoteVideo_btn = document.getElementById('js-remote-fullscreen');
const localVideo_btn = document.getElementById('js-local-fullscreen');
const localVideoDIC = document.getElementById('localVideoDIV');
const remoteVideoDIC = document.getElementById('remoteVideoDIV');
remoteVideo_btn.addEventListener("click", async (e) => {
    openFullscreen(remoteVideoDIC);
});
localVideo_btn.addEventListener("click", async (e) => {
    openFullscreen(localVideoDIC);
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
            document.getElementById('js-message-box').innerHTML = _data.message;
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
                oceanPairs.every(p => {
                    if (p.f1 == the_fishID) {
                        console.log("Should send an OFFER")
                        await startMediaSharing();
                        createOffer_user1();
                        return false;
                    }
                    return true;
                })

            } else
                if (_data.type == 'f1_offer') {
                    //Im user 2
                    await startMediaSharing()
                    createAnswerAndConnect_user2(_data._offer, _data._f1);
                } else
                    if (_data.type == 'f2_answer') {
                        //Im user 1
                        processAnswerWhenReady_user1(_data._answer, _data._f2);
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
// const stop_btn = document.getElementById('js-stop-btn');

let peerConnection = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });

//Monitor the state of the Peer Connection
peerConnection.onconnectionstatechange = function (event) {
    document.getElementById('js-message-box').innerHTML = 'State changed ' + peerConnection.connectionState;
    console.log('State changed ' + peerConnection.connectionState);
}

// //try to connect to the user
// setTimeout(() => {
//     if (peerConnection.connectionState != 'connected') {
//         alert("Your match left.");
//         deleteParticipantsInfo();
//         closeVideoCall();
//     }
//     // 30 seconds
// }, 18880000);
// stop_btn.addEventListener("click", async (e) => {
//     deleteParticipantsInfo();
//     closeVideoCall();
// });
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
// await startMediaSharing();



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
async function createOffer_user1() {
    console.log("in createOffer_user1")
    dataChannel = peerConnection.createDataChannel('channel1');
    dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    dataChannel.onopen = e => console.log('Connection opened');
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
    };
    const offer = await peerConnection.createOffer(offerOptions);
    await peerConnection.setLocalDescription(offer);
    setTimeout(() => {
        console.log('PUT OFFER');
        const data = {
            type: 'f1_offer',
            _fishID: the_fishID,
            _oceanID: the_oceanID,
            _offer: peerConnection.localDescription,
            _f1: the_fishID
        }
        socket.send(JSON.stringify(data));
    }, 2000)
}
async function createAnswerAndConnect_user2(_offer, _f1) {
    peerConnection.addEventListener('datachannel', event => {
        dataChannel = event.channel;
        dataChannel.onopen = e => console.log('Connection opened');
        dataChannel.onmessage = e => console.log('Got a message: ' + e.data);
    });
    peerConnection.onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
        setTimeout(() => {
            console.log("PUT ANSWER");
            const data = {
                type: 'f2_answer',
                _fishID: the_fishID,
                _oceanID: the_oceanID,
                _answer: peerConnection.localDescription,
                _f1: _f1,
                _f2: the_fishID
            }
            socket.send(JSON.stringify(data));
            // user2_answer: peerConnection.localDescription
        }, 2000)
    };
    const remoteDesc = new RTCSessionDescription(_offer);
    await peerConnection.setRemoteDescription(remoteDesc);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
}
// //~~~~~~~~~~~refactored~~~~~~~~~~~
async function processAnswerWhenReady_user1(_answer, _f2) {
    console.log('in processAnswerWhenReady_user1');
    const remoteDesc = new RTCSessionDescription(_answer);
    await peerConnection.setRemoteDescription(remoteDesc);
    console.log('ACCEPT ANSWER');
    // const data = {
    //     type: 'f1_connected',
    //     _fishID: the_fishID,
    //     _oceanID: the_oceanID,
    //     _f1: the_fishID,
    //     _f2: _f2
    // }
    // socket.send(JSON.stringify(data));
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