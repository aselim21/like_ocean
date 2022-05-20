if(!window.localStorage.fish_id) window.localStorage.setItem('fish_id', `${Math.floor(Math.random() * 10000000)}`);
let room_id;
// const socket_URL = 'ws://localhost:8080';
const socket_URL = 'wss://ocean-ag.herokuapp.com';
let socket = new WebSocket(socket_URL);

socket.addEventListener('open', function (event) {
    const data = {
        type:'hello',
        _fishID : window.localStorage.fish_id
    }
    socket.send(JSON.stringify(data));
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ');
    let _data;
    try {
      _data = JSON.parse(event.data);
    } catch (error) {
      console.log('PROBLEM!!!! with PARSE')
    }
    console.log(_data)
    if(_data.type == 0 || _data.type == 1 ){
        document.getElementById('js-message-box').innerHTML = _data.message;
    }
    if(_data.type == 'oceanID'){
        login_btn.disabled = true;
        document.cookie = `oceanID=${_data.message}`
        window.location.assign(`/ocean.html`)
        // window.location.assign(`//${_data.message}`);
    }
});
// socket.emit('message', "HELLO FROM CLIENT");

//WEB SOCKET Interaction
const register_btn = document.getElementById('js-register-btn');
register_btn.addEventListener("click", async (e) => {
    const the_form = document.getElementById("js-register-form");
    const data = {
        type : 'register',
        _oceanName : the_form.elements[0].value,
        _pwd : the_form.elements[1].value,
        _MaxFish : the_form.elements[2].value
    }
    socket.send(JSON.stringify(data))
});

const login_btn = document.getElementById('js-login-btn');
login_btn.addEventListener("click", async (e) => {
    const the_form = document.getElementById("js-connect-form");
    const data = {
        type : 'login',
        _oceanName : the_form.elements[0].value,
        _pwd : the_form.elements[1].value,
        _fishID : window.localStorage.fish_id
    }
    socket.send(JSON.stringify(data));
});
//listen btn click
const clean_btn = document.getElementById('js-clean-btn');
clean_btn.addEventListener("click", async (e) => {
    const the_form = document.getElementById("js-connect-form");
    const data = {
        type : 'clean',
        _oceanName : the_form.elements[0].value,
        _pwd : the_form.elements[1].value,
    }
    socket.send(JSON.stringify(data));
});

// async function deleteParticipantsInfo() {
//     const response = await fetch(`${serverURL_oceans}/oceans`, {
//         method: 'DELETE',
//         headers: headers,
//     });
//     return response.json();
// };
// //listen btn click
// const room_btn = document.getElementById('js-room-btn');
// room_btn.addEventListener("click", async (e) => {
//     const the_fish_id = window.localStorage.fish_id;
//     const data = {
//         userId: the_fish_id
//     };
//     room_id = await sendUserId(data);
//     location.assign(`${serverURL_oceans}/oceans/${room_id}`);

// });

// // //Requests
// async function sendUserId(_data) {
//     const response = await fetch(`${serverURL_oceans}/oceans`, {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify(_data)
//     });
//     return response.json();
// }

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




