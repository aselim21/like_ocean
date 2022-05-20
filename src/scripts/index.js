// const serverURL_oceans = 'http://localhost:8080';
// const serverURL_oceans = 'https://ocean-ag.herokuapp.com';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append("Access-Control-Allow-Credentials", "true");
headers.append("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Cookie, Set-Cookie, Authorization');
headers.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
window.localStorage.setItem('fish_id', `${Math.floor(Math.random() * 10000000)}`);

let room_id;

//web socket TEST
// const socket_URL = 'ws://localhost:8080';
const socket_URL = 'wss://ocean-ag.herokuapp.com';
// const socket = new WebSocket('ws://localhost:8080');
let socket = new WebSocket(socket_URL);


socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ');
    console.log(event.data);
});

// //kyle TEST
// const socket = io('/');

// socket.emit('message', "HELLO FROM CLIENT");

//listen btn click
const clean_btn = document.getElementById('js-clean-btn');
clean_btn.addEventListener("click", async (e) => {
    const result = await deleteParticipantsInfo();
    console.log(result);
});

async function deleteParticipantsInfo() {
    const response = await fetch(`${serverURL_oceans}/oceans`, {
        method: 'DELETE',
        headers: headers,
    });
    return response.json();
};
//listen btn click
const room_btn = document.getElementById('js-room-btn');
room_btn.addEventListener("click", async (e) => {
    const the_fish_id = window.localStorage.fish_id;
    const data = {
        userId: the_fish_id
    };
    room_id = await sendUserId(data);
    location.assign(`${serverURL_oceans}/oceans/${room_id}`);

});

// //Requests
async function sendUserId(_data) {
    const response = await fetch(`${serverURL_oceans}/oceans`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(_data)
    });
    return response.json();
}

//Listen to the js-login-btn
// const login_btn = document.getElementById('js-login-btn');
// login_btn.addEventListener("click", async (e) => {
//     const the_form = document.getElementById("js-connect-form");
//     const ocean_crd = the_form.elements[0].value + the_form.elements[1].value
//     const the_fish_id = window.localStorage.fish_id;
//     const data = {
//         userId: the_fish_id,
//         ocean_id: ocean_crd
//     }
//     getYourOceanID(data);
// });
// async function getYourOceanID(data) {
//     let ocean_id;
//     ocean_id = await createOcean_request(data);
//     // if (ocean_id == 'no-fishes') {
//     //     console.log('Match ID: ' + match_id)
//     //     setTimeout(async function () {
//     //         await getYourMatchID(data);
//     //     }, 5000)
//     // } else {
//         window.location.assign(`/oceans/${ocean_id}`);
//         // window.location.replace(`/room/${match_id}`);
//     // }
// }
// //Requests
// async function createOcean_request(data) {
//     const response = await fetch(`${serverURL_oceans}/oceans`, {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify(data)
//     });
//     return response.json();
// }




