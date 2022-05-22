if(!window.localStorage.fish_id) window.localStorage.setItem('fish_id', `${Math.floor(Math.random() * 10000000)}`);
const socket_URL = 'wss://ocean-ag.herokuapp.com';
// const socket_URL = 'ws://localhost:8080';
let socket = new WebSocket(socket_URL);

// if (location.protocol !== 'https:') {
//     location.replace(`https:${location.href.substring(location.protocol.length)}`);
// }

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
      console.error('Error of JSON.Parse')
    }
    console.log(_data)
    if(_data.type == 0 || _data.type == 1 ){
        document.getElementById('js-message-box').innerHTML = _data.message;
    }
    if(_data.type == 'oceanID'){
        login_btn.disabled = true;
        document.cookie = `oceanID=${_data.message}`
        window.location.assign(`/ocean.html`)
    }
});

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



