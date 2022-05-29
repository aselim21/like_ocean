//--------------------------------Variables--------------------------------
const URL_OceanService = 'https://ocean-service.herokuapp.com';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');

// const socket_URL = 'ws://localhost:8080';
const socket_URL = 'wss://ocean-rtc-socket.herokuapp.com';
let socket = new WebSocket(socket_URL);
const the_ocean_id = window.localStorage.ocean_id;
const the_fish_id = window.localStorage.fish_id;

//--------------------------------VUE--------------------------------
const vm = Vue.createApp({
    el: '#video-call-page'
});


// vm.component("logo", {
//     props: [],
//     data() {
//         return {
//             message: "Test the component works"
//         }
//     },
//     template: `
//             <div id="welcome-logo" >
//                 <h1> <i id="wave-logo" space-around class="fas fa-water fa-solid fa-i-cursor fa-fade" style="--fa-animation-duration: 2s; --fa-fade-opacity: 0.6;"></i>LIKE <h1 class="small-word">an</h1> OCEAN</h1>
//             </div>
//         `,
//     methods: {

//     }
// });
vm.component("ocean-content-component", {
    props: [],
    data() {
        return {
            expanded: false,
            localMicOff: false,
            remoteSoundsOff: false,
            localVideoOff: false,
            localVideoPortrait: false,
            message: "Test the component works",
            localVideoDisplayed: true
        }
    },
    template: `
    <div id="main-ocean-container">
        <div id="videos-container">
            <div id="big-videos-container">
        
               

            </div>

            <div v-show="localVideoDisplayed" id="small-video-container">
                <video id="webcamVideo" autoplay></video>
            </div>
        </div>
        
        <div id="control-panel-container">
                <i @click="cleanOcean()" style="color:#BE6833" class="fas fa-skull-crossbones"></i>
                
                <i @click="openFullscreen(); expanded = !expanded" v-if="expanded ? false : true" class="fas fa-expand"></i>
                <i @click="closeFullscreen(); expanded = !expanded" v-if="expanded ? true : false" class="fas fa-compress"></i>

                <i @click="localMicOff = !localMicOff" v-if="localMicOff ? false : true" class="fas fa-microphone-slash"></i>
                <i @click="localMicOff = !localMicOff" v-if="localMicOff ? true : false" class="fas fa-microphone"></i>
              
                <i @click="muteVideos() ; remoteSoundsOff = !remoteSoundsOff" v-if="remoteSoundsOff ? false : true" class="fas fa-volume-xmark"></i>
                <i @click="unmuteVideos() ; remoteSoundsOff = !remoteSoundsOff" v-if="remoteSoundsOff ? true : false" class="fas fa-volume-high"></i>

                <i @click="localVideoOff = !localVideoOff" v-if="localVideoOff ? false : true" class="fas fa-video-slash"></i>
                <i @click="localVideoOff = !localVideoOff" v-if="localVideoOff ? true : false" class="fas fa-video"></i>
                
                <i @click="localVideoDisplayed = !localVideoDisplayed" class="fas fa-photo-film"></i>
                
                <!--- i @click="" class="fas fa-shuffle"></i--->
        </div>
    </div>
           
        `,
    methods: {
        openFullscreen() {
            const _elem = document.getElementById('main-ocean-container');
            if (_elem.requestFullscreen) {
                _elem.requestFullscreen();
            } else if (_elem.mozRequestFullScreen) {
                _elem.mozRequestFullScreen();
            } else if (_elem.webkitRequestFullscreen) {
                _elem.webkitRequestFullscreen();
            } else if (_elem.msRequestFullscreen) {
                _elem.msRequestFullscreen();
            }
        },
        closeFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        },
        cleanOcean(){
            console.log("in the cleanOcean()")
            if(PeerCon_COUNTER <= 0){
                console.log("there is no connection");
                return 1;
            }else{
                const data = {
                    type: 'clean',
                    fish_id: the_fish_id,
                    ocean_id: the_ocean_id
                }
                socket.send(JSON.stringify(data));
            }
        },
        HideShowMyVideo(){
            console.log(_el)
            const _elem = document.getElementById('small-video-container');

        },
        muteVideos(){
            const _elCluster = document.getElementById("big-videos-container").childNodes;
            _elCluster.forEach((el)=>{
                el.setAttribute("muted","true")
            })
        },
        unmuteVideos(){
            const _elCluster = document.getElementById("big-videos-container").childNodes;
            _elCluster.forEach((el)=>{
                el.setAttribute("muted","false")
                // el.removeAttribute("muted")
            })
        }
        
    }
});

//--------------------------------VUE-Mount--------------------------------
vm.mount('#video-call-page');

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
// let messageBox = document.getElementById('js-message-box');
const localVideo = document.getElementById('webcamVideo');






window.addEventListener('DOMContentLoaded', async (event) => {
    console.log('DOM fully loaded and parsed');

    setOrientationSmallVideoC();
    setOrientationBigVideoC();
    

    localVideo.addEventListener('loadedmetadata', function () {
        console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
    });

    socket.addEventListener('open', function (event) {
        const data = {
            type: 'StartSignaling',
            fish_id: the_fish_id,
            ocean_id: the_ocean_id
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
                // messageBox.innerHTML = _data.message;
                console.log(_data.message)
            } else
                if (_data.type == 'OceanInfoUpdated') {
                    console.log("in the info updated")
                    const oceanPairs = _data.message;
                    // fist check the Connection Number 
                    updatePeerCon_COUNTER(oceanPairs).then(async function (_newPeerCOUNTER) {
                        for (const p of oceanPairs) {
                            if (p.f1 == the_fish_id && p.connected == false) {

                                const new_connection_name = p.f1 + '-' + p.f2;
                                console.log(`New Connection name: ${new_connection_name}`);
                                // messageBox.innerHTML = `New Connection name: ${new_connection_name}. Will send an offer.`;

                                console.log("Will send offer to ", p.f2);
                                await createPeerCon(new_connection_name, _newPeerCOUNTER);
                                await startMediaSharing(new_connection_name, _newPeerCOUNTER);
                                await createDataChn(new_connection_name, _newPeerCOUNTER);
                                await createOffer_user1(_newPeerCOUNTER);
                                return false;
                            } if (p.f1 != the_fish_id && p.connected == false) {
                                return false;
                            }
                        }
                    })
                } else
                    if (_data.type == 'f1_offer') {
                        const currentPeerCOUNTER = PeerCon_COUNTER;
                        //Im user 2
                        let new_connection_name = _data.f1 + '-' + _data.f2;
                        console.log(`Received an offer from: ${new_connection_name}`);
                        // messageBox.innerHTML = `Received an offer from: ${new_connection_name}`;
                        console.log(`Received an offer from: ${new_connection_name}`)
                        await createPeerCon(new_connection_name, currentPeerCOUNTER);
                        await startMediaSharing(new_connection_name, currentPeerCOUNTER);
                        await createAnswerAndConnect_user2(_data.offer, _data.f1, currentPeerCOUNTER);
                    } else
                        if (_data.type == 'f2_answer') {
                            //Im user 1
                            let new_connection_name = _data.f1 + '-' + _data.f2;
                            console.log("Received an answer from: ", _data.f2);
                            // messageBox.innerHTML = `Received an answer from: ${new_connection_name}`;
                            console.log(`Received an answer from: ${new_connection_name}`)
                            const currentPeerCOUNTER = PeerCon_COUNTER;
                            await processAnswerWhenReady_user1(_data.answer, _data.f2, currentPeerCOUNTER);
                        }
        });
    });




















});


//Helping Fucntions

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
function setOrientationSmallVideoC() {
    const _el = document.getElementById('small-video-container');
    let width = _el.clientWidth;
    let height = _el.clientHeight;
    let width_20p = width * (20 / 100);
    let height_20p = height * (20 / 100);
    console.log(width, height)

    if (width >= height) {
        _el.setAttribute("orientsmall-landscape", "")
    } else {
        _el.setAttribute("orientsmall-portrait", "")
    }
}
function setOrientationBigVideoC() {
    const _el = document.getElementById('big-videos-container');
    let width = _el.clientWidth;
    let height = _el.clientHeight;
    let width_20p = width * (20 / 100);
    let height_20p = height * (20 / 100);
    console.log(width, height)

    if (width >= height) {
        _el.setAttribute("orientbig-landscape", "")
    } else {
        _el.setAttribute("orientbig-portrait", "")
    }
}

function disconnectedFishCleanScreen(_name) {
    // const remoteVideo = document.querySelector(`video[pair="${_name}"]`);
    const remoteVideoDIV = document.querySelector(`video[pair="${_name}"]`);
    remoteVideoDIV.remove();
}
async function createRemoteVideoElement(_name) {
    // const remoteVideoDIV = document.createElement('div');
    // remoteVideoDIV.setAttribute('pair', _name);
    // remoteVideoDIV.setAttribute('class', 'remoteVideoDIV');
    const remoteVideo = document.createElement('video');
    remoteVideo.setAttribute('pair', _name);
    remoteVideo.setAttribute('class', 'remoteVideo');
    remoteVideo.setAttribute('autoplay','');
    // const remoteVideo_btn = document.createElement('button');
    // remoteVideo_btn.setAttribute('pair', _name);
    // remoteVideo_btn.setAttribute('class', 'js-remote-fullscreen');
    // remoteVideo_btn.innerHTML = "Remote Video Full Screen";

    // remoteVideoDIV.appendChild(remoteVideo);

    const videosCluster = document.getElementById("big-videos-container");
    // videosCluster.insertBefore(remoteVideo_btn, videosCluster.children[0]);
    videosCluster.insertBefore(remoteVideo, videosCluster.children[0]);
}

//Web Socket Functions
async function createPeerCon(_name, _PeerCOUNTER) {
    PEER_CONNECTIONS[_PeerCOUNTER] = new RTCPeerConnection({ configuration: configuration, iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }] });
    PEER_CONNECTIONS[_PeerCOUNTER].onconnectionstatechange = function (event) {
        // document.getElementById('js-message-box').innerHTML = 'State changed of: ' + _name + ' = ' + PEER_CONNECTIONS[_PeerCOUNTER].connectionState;
        console.log('State changed of: ' + _name + ' = ' + PEER_CONNECTIONS[_PeerCOUNTER].connectionState);
        if (PEER_CONNECTIONS[_PeerCOUNTER].connectionState == 'disconnected') {
            disconnectedFishCleanScreen(_name);
        }
    }
    PEER_CONNECTIONS[_PeerCOUNTER].oniceconnectionstatechange = function () {
        console.log('New ICE state: ', PEER_CONNECTIONS[_PeerCOUNTER].iceConnectionState);
    }
}

async function createDataChn(_name, _PeerCOUNTER) {
    DATA_CHANNELS[_PeerCOUNTER] = PEER_CONNECTIONS[_PeerCOUNTER].createDataChannel(_name);
    DATA_CHANNELS[_PeerCOUNTER].onmessage = e => console.log('Got a message: ' + e.data);
    // DATA_CHANNELS[_PeerCOUNTER].onopen = e => console.log('Connection opened');
    PEER_CONNECTIONS[_PeerCOUNTER].onicecandidate = function (e) {
        console.log("ICE candidate (peerConnection)", e);
    };
}

async function updatePeerCon_COUNTER(_pairs) {
    return new Promise(function (resolve, reject) {
        let connectionsCounter = 0;
        _pairs.forEach(p => {
            if ((p.f1 == the_fish_id || p.f2 == the_fish_id) && p.connected == true)
                connectionsCounter++;
        })
        const newDoneConnections = connectionsCounter - PeerCon_COUNTER;
        PeerCon_COUNTER += newDoneConnections;
        if (newDoneConnections > 1) {
            // messageBox.innerHTML = "Something went wrong with your connections."
            console.log("Something went wrong with your connections.")
            reject(newDoneConnections);
        } else {
            console.log('NEW PEERCOUNTER = ', PeerCon_COUNTER);
            resolve(PeerCon_COUNTER);
        }
    })
}


async function startMediaSharing(_name, _PeerCOUNTER) {
    if (!document.querySelector(`video[pair="${_name}"]`)) {
        await createRemoteVideoElement(_name);
    }

    const remoteVideo = document.querySelector(`video[pair="${_name}"]`);
    // const remoteVideoDIV = document.querySelector(`div[pair="${_name}"]`);
    // const remoteVideo_btn = document.querySelector(`button[pair="${_name}"]`);
    const mediaConstraints_toSend = { audio: true, video: true };
    const mediaConstraints_toDisplay = { audio: false, video: true };

    let localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints_toSend);
    let localStream_toDisplay = await navigator.mediaDevices.getUserMedia(mediaConstraints_toDisplay);
    let remoteStream = new MediaStream();

    // remoteVideo_btn.addEventListener("click", async (e) => {
    //     openFullscreen(remoteVideoDIV);
    // });
    remoteVideo.addEventListener('loadedmetadata', function () {
        console.log(`Remote video video Width: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
    });

    localVideo.srcObject = localStream_toDisplay;
    localStream.getTracks().forEach((track) => {
        console.log("tracks sent");
        PEER_CONNECTIONS[_PeerCOUNTER].addTrack(track, localStream);
    });


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
            fish_id: the_fish_id,
            ocean_id: the_ocean_id,
            offer: PEER_CONNECTIONS[_PeerCOUNTER].localDescription,
            f1: the_fish_id
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
                fish_id: the_fish_id,
                ocean_id: the_ocean_id,
                answer: PEER_CONNECTIONS[_PeerCOUNTER].localDescription,
                f1: _f1,
                f2: the_fish_id
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
        fish_id: the_fish_id,
        ocean_id: the_ocean_id,
        f1: the_fish_id,
        f2: _f2
    }
    socket.send(JSON.stringify(data));
}
