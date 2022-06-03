//--------------------------------Variables--------------------------------
const URL_OceanService = 'https://ocean-service.herokuapp.com';
// const URL_OceanService = 'http://localhost:3001';

//set oceanID cookie to null
window.localStorage.setItem('ocean_id', '');
const the_fish_id = window.localStorage.fish_id;

//--------------------------------VUE--------------------------------
var vm = Vue.createApp({
    el: '#start-page'
});


vm.component("logo", {
    props: [],
    data() {
        return {
            message: "Test the component works"
        }
    },
    template: `
            <div id="welcome-logo" >
                <h1> <i id="wave-logo" space-around class="fas fa-water fa-solid fa-i-cursor fa-fade" style="--fa-animation-duration: 2s; --fa-fade-opacity: 0.6;"></i>LIKE <h1 class="small-word">an</h1> OCEAN</h1>
            </div>
        `,
    methods: {

    }
});

vm.component("main-content-component", {
    props: [],
    data() {
        return {
            message: 0,
            showFormLoginFish: false,
            showFormRegFish: false,
            showFormEnter: false,
            showFormCreate: false,
            fish_id : window.localStorage.fish_id
            
        }
    },
    template: `
            <div v-show=" !!message ? true : false" class="message-box" >
                <p>{{message}}</p>
            </div>
            
            <div class="forms">
                <div id=login-fish-div>
                    <p @click="showFormLoginFish = !showFormLoginFish" class="noselect" id="show-hide-icon">
                        <i v-if="showFormLoginFish ? false : true" class=" fas fa-regular fa-plus"></i>
                        <i v-if="showFormLoginFish ? true : false" class="fas fa-minus"></i>
                        Login as a Fish <i class="fas fa-fish"></i>
                    </p>
                    <form v-show="showFormLoginFish || !fish_id" ref="js-login-fish-form" id="js-login-fish-form" name="login-fish-form">
                        <p>Name</p>
                        <input type="text" name="fish-name" id="js-fish-name"/>
                        <p>Password</p>
                        <input type="password" name="fish-login-pwd" id="js-fish-login-pwd"/>
                        <input @click="req_loginFish()" type="button" name="login-fish" id="js-login-fish-btn" value="Login"/>
                    </form>
                </div>   
                <div id=reg-fish-div>
                    <p @click="showFormRegFish = !showFormRegFish" class="noselect" id="show-hide-icon">
                        <i v-if="showFormRegFish ? false : true" class=" fas fa-regular fa-plus"></i>
                        <i v-if="showFormRegFish ? true : false" class="fas fa-minus"></i>
                        Register a Fish <i class="fas fa-fish"></i>
                    </p>
                    <form v-show="showFormRegFish" ref="js-register-fish-form" id="js-register-fish-form" name="register-fish-form">
                        <p>Name</p>
                        <input type="text" name="fish-name-new" id="js-fish-name-new"/>
                        <p>Password</p>
                        <input type="password" name="fish-reg-pwd" id="js-fish-reg-pwd"/>
                        <p>Repeat password</p>
                        <input type="password" name="fish-reg-pwd-repeat" id="js-fish-reg-pwd-repeat"/>
                        <input @click="req_registerFish()" type="button" name="register-fish" id="js-register-fish-btn" value="Register"/>
                    </form>
                </div>    
                <div id=create-ocean-div>
                    <p @click="showFormCreate = !showFormCreate" class="noselect" id="show-hide-icon">
                        <i v-if="showFormCreate ? false : true" class=" fas fa-regular fa-plus"></i>
                        <i v-if="showFormCreate ? true : false" class="fas fa-minus"></i>
                        Create an Ocean <i class="fas fa-water"></i>
                    </p>
                    <form v-show="showFormCreate" id="js-register-ocean-form" name="register-ocean-form">
                        <p>Ocean's name</p>
                        <input type="text" name="ocean-name-new" id="js-ocean-name-new"/>
                        <p>Secret key</p>
                        <input type="password" name="ocean-pwd-new" id="js-ocean-pwd-new"/>
                        <p>Max Fish</p>
                        <input type="number" min="1" value="2" name="ocean-MaxFish" id="js-ocean-MaxFish"/>
                        <p @click="" class="noselect" >
                            <i class=" fas fa-regular fa-plus"></i>
                            Add a specific Fish
                        </p>

                        <input @click="req_registerOcean()" type="button" name="register" id="js-register-ocean-btn" value="Create"/>
                    </form>
                </div>
                <div id=enter-ocean-div>
                    <p @click="showFormEnter = !showFormEnter" class="noselect" id="show-hide-icon">
                        <i v-if="showFormEnter ? false : true" class=" fas fa-regular fa-plus"></i>
                        <i v-if="showFormEnter ? true : false" class="fas fa-minus"></i>
                        Enter an Ocean <i class="fas fa-person-swimming"></i>
                    </p>
                    <form v-show="showFormEnter" id="js-enter-ocean-form" name="enter-ocean-form" >
                        <p>Ocean's name</p>
                        <input type="text" name="ocean-name" id="js-ocean-name"/>
                        <p>Secret key</p>
                        <input type="password" name="ocean-pwd" id="js-ocean-pwd"/>
                        <input  @click="req_enterOcean()" type="button" name="login" id="js-enter-ocean-btn" value="Enter"/>
                        <input type="button" name="clean" id="js-clean-ocean-btn" value="Clean the ocean"/>
                    </form>
                </div>
            </div>
            
        `,
    methods: {
        async req_findFishName(){
            const response = await axios.get(`${URL_OceanService}/fish/${the_fish_id}`, {withCredentials: true});
            if (response.data.type != 'error') {
                this.message = `Ahoy, ${response.data.name}`;
            }
        },
        async req_loginFish(){
            const the_form = document.querySelector('#js-login-fish-form');
            const data = {
                fishName: the_form.elements[0].value,
                pwd: the_form.elements[1].value
            }
            const response = await axios.post(`${URL_OceanService}/fishlogin`, data, {withCredentials: true});
            this.message = response.data.message;
            if (response.data.type === 'message') {
                window.localStorage.setItem('fish_id', response.data.fishID);
            }
        },
        async req_registerFish() {
            const the_form = document.querySelector('#js-register-fish-form');
            // check if the passwords match
            if(the_form.elements[1].value !== the_form.elements[2].value){
                this.message = "Your passwords don't match!";
                return 0;
            }
            const data = {
                fishName: the_form.elements[0].value,
                pwd: the_form.elements[1].value
            }
            const response = await axios.post(`${URL_OceanService}/fish`, data, {withCredentials: true});
            this.message = response.data.message;
            if (response.data.type === 'message') {
                this.showFormLoginFish = true;
                const the_loginForm = document.querySelector('#js-login-fish-form');
                the_loginForm.elements[0].value = the_form.elements[0].value
                the_loginForm.elements[1].value = the_form.elements[1].value
            }
        },
        async req_registerOcean() {
            const the_form = document.querySelector('#js-register-ocean-form');
            const data = {
                oceanName: the_form.elements[0].value,
                pwd: the_form.elements[1].value,
                maxFish: the_form.elements[2].value,
                requiredFish: []
            }
            const response = await axios.post(`${URL_OceanService}/oceans`, data, {withCredentials: true});
            this.message = response.data.message;
            if (response.data.type === 'message') {
                this.showFormEnter = true;
                const the_enterForm = document.querySelector('#js-enter-ocean-form');
                the_enterForm.elements[0].value = the_form.elements[0].value
                the_enterForm.elements[1].value = the_form.elements[1].value
            }
        },
        async req_enterOcean() {
            const the_form = document.getElementById("js-enter-ocean-form");
            const the_fish_id = window.localStorage.fish_id;
            if (!!the_fish_id) {
                const data = {
                    oceanName: the_form.elements[0].value,
                    pwd: the_form.elements[1].value,
                    fishID: window.localStorage.fish_id
                }
                const response = await axios.put(`${URL_OceanService}/login`, data, {withCredentials: true});
                this.message = response.data.message;
                if (response.data.type === 'message') {
                    // window.localStorage.setItem('ocean_id', response.data.oceanID);
                    window.location.assign(`/ocean/${response.data.oceanID}`);
                }
            } else {
                this.message = "Please first register as a Fish!"
            }

        }
    },
    beforeMount(){
        this.req_findFishName();
     },
});



//--------------------------------VUE-Mount--------------------------------
vm.mount('#start-page');



// console.log(Notification.permission)

// switch(Notification.permission){
//     case 'default':
//         Notification.requestPermission().then((permission) => {
//             console.log(permission)
//         })
//         break;
//     case 'denied':
//         console.log('-------Permission denied');
//         break;
//     case 'granted':
//         console.log("-----Permission granted")
//         setTimeout(() => {
//             showNotification("Like Ocean Message", "You have a new call sth")
//         }, 10000);
        
//         break;
// }

// function showNotification(_title, _msg){
//     const notif = new Notification(_title,{
//         body:_msg,
//         requireInteraction: true,
//         vibrate: [200, 100, 200, 100, 200, 100, 200]
//     })
//     notif.onclick = () => window.open('https://ocean-ag.herokuapp.com');
//     console.log(notif)
// }
