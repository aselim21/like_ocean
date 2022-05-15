// const serverURL_oceans = 'http://localhost:3000';
const serverURL_oceans = 'https://ocean-ag.herokuapp.com';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append("Access-Control-Allow-Credentials", "true");
headers.append("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Cookie, Set-Cookie, Authorization');
headers.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
window.localStorage.setItem('fish_id', `${Math.floor(Math.random() * 10000000)}`);

let room_id;

//listen btn click
const clean_btn = document.getElementById('js-clean-btn');
clean_btn.addEventListener("click", async (e) => {
    deleteParticipantsInfo()

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
    location.assign(`https://like-ocean.herokuapp.com/oceans/${room_id}`);

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




