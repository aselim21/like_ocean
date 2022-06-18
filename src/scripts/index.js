//--------------------------------Variables--------------------------------
const URL_OceanService = 'https://ocean-service.herokuapp.com';
// const URL_OceanService = 'http://localhost:3001';
let serviceWorkerRegistration;
let pushSubscription;
let publicKey = 'BN7lXMb9mH4fa2BBsvrfI2fv424uENFrNy7M0bJ8q9DgggRkYfxT6k2XKZ3KQ_WTHaF2RTpC0KQmd-oIB50YApE';

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
vm.component("specFish", {
    props: [],
    data() {
        return {
            message: "Test the component works"
        }
    },
    template: `
            <li>
                <input type="text" placeholder="Fish"/>
                <i class="fas fa-trash clickable-element"></i>    
            </li>
        `,
    methods: {

    }
});


vm.component("main-content-component", {
    props: [],
    data() {
        return {
            message: 0,
            showMyOceans: false,
            showFormLoginFish: false,
            showFormRegFish: false,
            showFormEnter: false,
            showFormCreate: false,
            fish_id_exists: false,
            acceptedOceans: [],
            requiredOceans: [],
            specFishCounter: 0,
            maxFishInput: 2,

        }
    },
    template: `
            <div v-show=" !!message ? true : false" class="message-box" >
                <p>{{message}}</p>
            </div>
            
            <div class="forms">
                <div v-show="fish_id_exists" id="fish-oceans">
                    <p @click="showMyOceans = !showMyOceans; if(showMyOceans) req_getOceansForFish()" class="noselect show-hide-icon">
                        <i v-if="showMyOceans ? false : true" class=" fas fa-regular fa-plus"></i>
                        <i v-if="showMyOceans ? true : false" class="fas fa-minus"></i>
                        My Oceans <i class="fa-solid fa-anchor"></i>
                    </p>
                    <div v-show="showMyOceans">
                        <ul id="accepted-oceans">
                            <li v-for="ocean in acceptedOceans" >
                                <i id="wave-logo" space-around class="fas fa-water fa-solid fa-i-cursor fa-fade" style="--fa-animation-duration: 2s; --fa-fade-opacity: 0.6;"></i>
                                <button @click="selectOcean(ocean)" class="button-dark" >{{ ocean }}</button>
                            </li>
                        </ul>
                        <ul id="required-oceans">
                            <li v-for="ocean in requiredOceans">
                                <i class="fa-solid fa-water"></i> 
                                <button @click="selectOcean(ocean)" class="button-dark" >{{ ocean }}</button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="forms_cluster">
                    <div v-show="!fish_id_exists" id="login-fish-div">
                        <p @click="showFormLoginFish = !showFormLoginFish" class="noselect show-hide-icon">
                            <i v-if="showFormLoginFish ? false : true" class=" fas fa-regular fa-plus"></i>
                            <i v-if="showFormLoginFish ? true : false" class="fas fa-minus"></i>
                            Login as a Fish <i class="fas fa-fish"></i>
                        </p>
                        <form v-show="showFormLoginFish" ref="js-login-fish-form" id="js-login-fish-form" name="login-fish-form">
                            <p>Name</p>
                            <input type="text" name="fish-name" id="js-fish-name" autocomplete="login-fish-name"/>
                            <p>Password</p>
                            <input type="password" name="fish-login-pwd" id="js-fish-login-pwd" autocomplete="login-fish-pwd" />
                            <input @click="req_loginFish()" type="button" name="login-fish" id="js-login-fish-btn" class="button-dark" value="Login"/>
                        </form>
                    </div>   
                    <div v-show="!fish_id_exists" id="reg-fish-div">
                        <p @click="showFormRegFish = !showFormRegFish" class="noselect show-hide-icon">
                            <i v-if="showFormRegFish ? false : true" class=" fas fa-regular fa-plus"></i>
                            <i v-if="showFormRegFish ? true : false" class="fas fa-minus"></i>
                            Register a Fish <i class="fas fa-fish"></i>
                        </p>
                        <form v-show="showFormRegFish" ref="js-register-fish-form" id="js-register-fish-form" name="register-fish-form">
                            <p>Name</p>
                            <input type="text" name="fish-name-new" id="js-fish-name-new" autocomplete="register fish-name"/>
                            <p>Password</p>
                            <input type="password" name="fish-reg-pwd" id="js-fish-reg-pwd" autocomplete="register fish-pwd"/>
                            <p>Repeat password</p>
                            <input type="password" name="fish-reg-pwd-repeat" id="js-fish-reg-pwd-repeat" autocomplete="register-fish-pwd-repeat"/>
                            <input @click="req_registerFish()" type="button" name="register-fish" id="js-register-fish-btn" class="button-dark" value="Register"/>
                        </form>
                    </div>
                </div>
                <div class="forms_cluster">   
                <div id="enter-ocean-div">
                        <p @click="showFormEnter = !showFormEnter" class="noselect show-hide-icon">
                            <i v-if="showFormEnter ? false : true" class=" fas fa-regular fa-plus"></i>
                            <i v-if="showFormEnter ? true : false" class="fas fa-minus"></i>
                            Enter an Ocean <i class="fas fa-person-swimming"></i>
                        </p>
                        <form v-show="showFormEnter" id="js-enter-ocean-form" name="enter-ocean-form" >
                            <p>Ocean's name</p>
                            <input type="text" name="ocean-name" id="js-ocean-name" autocomplete="enter ocean-name"/>
                            <p>Secret key</p>
                            <input type="password" name="ocean-pwd" id="js-ocean-pwd" autocomplete="enter ocean-pwd"/>
                            <input  @click="req_enterOcean()" type="button" name="login" id="js-enter-ocean-btn" class="button-dark" value="Enter"/>
                            <input type="button" name="clean" id="js-clean-ocean-btn" class="button-dark" value="Clean the ocean"/>
                        </form>
                    </div> 
                    <div id="create-ocean-div">
                        <p @click="showFormCreate = !showFormCreate" class="noselect show-hide-icon">
                            <i v-if="showFormCreate ? false : true" class=" fas fa-regular fa-plus"></i>
                            <i v-if="showFormCreate ? true : false" class="fas fa-minus"></i>
                            Create an Ocean <i class="fa-brands fa-drupal"></i>
                        </p>
                        <form v-show="showFormCreate" id="js-register-ocean-form" name="register-ocean-form">
                            <p>Ocean's name</p>
                            <input type="text" name="ocean-name-new" id="js-ocean-name-new" autocomplete="create ocean-name"/>
                            <p>Secret key</p>
                            <input type="password" name="ocean-pwd-new" id="js-ocean-pwd-new" autocomplete="create ocean-pwd"/>
                            <p>Max Fish</p>
                            <input v-model="maxFishInput" type="number" min="2" name="ocean-MaxFish" id="js-ocean-MaxFish"/>
                            
                            <p @click="addSpecFish()" class="clickable-element">
                                <i class=" fas fa-regular fa-plus"></i>
                                Add a specific Fish
                            </p>
                            <ul ref="specFishList" class="specFishList">
                                
                            </ul>
                            
                            <input @click="req_registerOcean()" type="button" name="register" id="js-register-ocean-btn" class="button-dark" value="Create"/>
                        </form>
                    </div>
                    
                </div>
                <div v-show="fish_id_exists" id="js-logout-fish">
                    <p @click="logout()" id="js-fish-logout" class="noselect show-hide-icon">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        Logout 
                    </p>
                </div>
            </div>
            
        `,
    methods: {

        addSpecFish() {

            const the_list = this.$refs.specFishList;
            // this.specFishCounter++; 

            // // if(the_list.childElementCount > this.maxFishInput){
            // //     this.maxFishInput = the_list.childElementCount
            // // }
            // console.log("after adding specFishCounter " ,this.specFishCounter )
            // console.log("Number of elements", the_list.childElementCount)
            this.specFishCounter++;
            const id = this.specFishCounter;
            const specFishCount = the_list.childElementCount + 1;
            if (specFishCount > this.maxFishInput) {
                this.maxFishInput = specFishCount
            }

            const liEl = document.createElement("li");
            const inputEl = document.createElement("input");
            const iEl = document.createElement("i");

            liEl.setAttribute('specFishID', id);
            inputEl.setAttribute('type', 'text');
            inputEl.setAttribute('placeholder', `Fish name`);
            iEl.setAttribute('class', 'fas fa-trash clickable-element');
            iEl.addEventListener('click', (e) => {
                this.deleteSpecFish(id)
            })
            // iEl.setAttribute('v-on:click', );
            liEl.appendChild(inputEl);
            liEl.appendChild(iEl);

            the_list.appendChild(liEl);

            console.log("Adding specFishCount ", specFishCount)
        },
        deleteSpecFish(_id) {
            console.log("Deleting id", _id)
            // const to_be_deletedEl = document.querySelector(`[id="${_id}"]`);
            document.querySelector(`[specFishID="${_id}"]`).remove();
            const the_list = this.$refs.specFishList;
            // the_list.appendChild(to_be_deletedEl);
            // document.querySelector(`[id="${_id}"]`).remove();

            const specFishCount = the_list.childElementCount + 1;
            console.log("Deleting specFishCount ", specFishCount)

            // console.log(this.specFishCounter);
            // const the_list = this.$refs.specFishList;
            // console.log(the_list.length)

            // // console.log(document.querySelector(`[count="${_counter}"]`));   

        },
        async logout() {
            window.localStorage.fish_id = '';
            this.fish_id_exists = false;
            this.req_findFishName();
            //also delete the subscription
            navigator.serviceWorker.ready.then(function (reg) {
                reg.pushManager.getSubscription().then(function (subscription) {
                    console.log(subscription)
                    const the_endpoint = subscription.endpoint.slice(36);
                    subscription.unsubscribe().then( async function (successful) {
                        // You've successfully unsubscribed
                        console.log("successfully unsubscribed")
                        
                        await axios.delete(`${URL_OceanService}/subscription/${the_endpoint}`);
                        // if (response.data.type != 'error') {
                        //    console.log("got positive response")
                        // }
                    }).catch(function (e) {
                        // Unsubscribing failed
                        console.error("couldnt unsubscribe", e)
                    })
                })
            });
        },
        async req_findFishName() {
            const the_fish_id = window.localStorage.fish_id;
            if (!!the_fish_id) {
                this.fish_id_exists = true;
                const response = await axios.get(`${URL_OceanService}/fish/${the_fish_id}`, { withCredentials: true });
                if (response.data.type != 'error') {
                    this.message = `Ahoy, ${response.data.name}`;
                }
            }
            else {
                this.fish_id_exists = false;
                this.message = null;
            }

        },
        async req_getOceansForFish() {
            const the_fish_id = window.localStorage.fish_id;
            if (!!the_fish_id) {
                const response = await axios.get(`${URL_OceanService}/oceans/fish/${the_fish_id}`, { withCredentials: true });
                if (response.data.type != 'error') {
                    this.acceptedOceans = response.data.acceptedOceans;
                    this.requiredOceans = response.data.requiredOceans;
                    console.log("Accepted", this.acceptedOceans)
                    console.log("Requested", this.requiredOceans);
                }
            }
        },
        selectOcean(_name) {
            this.showFormEnter = true;
            const the_form = document.getElementById("js-enter-ocean-form");
            the_form.elements[0].value = _name;
        },
        async req_loginFish() {
            const the_form = document.querySelector('#js-login-fish-form');
            const data = {
                fishName: the_form.elements[0].value,
                pwd: the_form.elements[1].value
            }
            const response = await axios.post(`${URL_OceanService}/fishlogin`, data, { withCredentials: true });
            this.message = response.data.message;
            if (response.data.type === 'message') {
                //set the id
                window.localStorage.setItem('fish_id', response.data.fishID);
                this.fish_id_exists = true;

                //empty the form
                the_form.elements[0].value = '';
                the_form.elements[1].value = '';

                this.req_getOceansForFish();
                this.req_subscribePushNotifications();
            }
        },
        async req_registerFish() {
            const the_form = document.querySelector('#js-register-fish-form');

            // check if the passwords match
            if (the_form.elements[1].value !== the_form.elements[2].value) {
                this.message = "Your passwords don't match!";
                return 0;
            }
            const data = {
                fishName: the_form.elements[0].value,
                pwd: the_form.elements[1].value
            }
            const response = await axios.post(`${URL_OceanService}/fish`, data, { withCredentials: true });
            this.message = response.data.message;
            if (response.data.type === 'message') {
                //switch to login
                this.showFormLoginFish = true;
                const the_loginForm = document.querySelector('#js-login-fish-form');
                the_loginForm.elements[0].value = the_form.elements[0].value
                the_loginForm.elements[1].value = the_form.elements[1].value

                //empty the form
                this.showFormRegFish = false;
                the_form.elements[0].value = '';
                the_form.elements[1].value = '';
                the_form.elements[2].value = '';
            }
        },
        async req_registerOcean() {

            const the_form = document.querySelector('#js-register-ocean-form');
            const the_specFishList = this.$refs.specFishList;
            const the_secFishNr = the_specFishList.childElementCount
            // console.log(the_form.elements);
            console.log(the_secFishNr);
            if (the_secFishNr > the_form.elements[2].value) {
                this.message = "You cannot have more special fish than MaxFish value."
                return 0;
            }
            let specFishNamesList = [];
            the_specFishList.childNodes.forEach(specFish => {
                if (specFish.childNodes[0].value != '' || specFish.childNodes[0].value != ' ')
                    specFishNamesList.push(specFish.childNodes[0].value)
            })

            const data = {
                oceanName: the_form.elements[0].value,
                pwd: the_form.elements[1].value,
                maxFish: the_form.elements[2].value,
                requiredFish: specFishNamesList
            }
            console.log(data)

            const response = await axios.post(`${URL_OceanService}/oceans`, data, { withCredentials: true });
            this.message = response.data.message;
            if (response.data.type === 'message') {
                //switch to enter ocean
                this.showFormEnter = true;
                const the_enterForm = document.querySelector('#js-enter-ocean-form');
                the_enterForm.elements[0].value = the_form.elements[0].value
                the_enterForm.elements[1].value = the_form.elements[1].value

                //empty the form
                this.showFormCreate = false;
                the_form.elements[0].value = '';
                the_form.elements[1].value = '';
                the_form.elements[2].value = 2;
                for (let i = 0; i < the_secFishNr; i++) {
                    the_specFishList.childNodes[0].remove()
                }
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
                const response = await axios.put(`${URL_OceanService}/login`, data, { withCredentials: true });
                this.message = response.data.message;
                if (response.data.type === 'message') {
                    // window.localStorage.setItem('ocean_id', response.data.oceanID);
                    window.location.assign(`/ocean/${response.data.oceanID}`);
                }
            } else {
                this.message = "Please first register as a Fish!"
            }

        },
        async req_subscribePushNotifications() {
            const the_fish_id = window.localStorage.fish_id;

            if ('serviceWorker' in navigator) {
                serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js')
                console.log('SW registered!');

                // serviceWorkerRegistration.update();
            }

            pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) //'<Your Public Key from generateVAPIDKeys()>'
            });

            // document.getElementById("js-fish-logout").addEventListener("click", function() {
            //     console.log(serviceWorkerRegistration.pushManager)
            //   });

            const dataToSend = {
                fishID: the_fish_id,
                sub: pushSubscription
            }
            console.log(JSON.stringify(pushSubscription))
            const response = await axios.post(`${URL_OceanService}/subscribe`, dataToSend);
            console.log(response.data);
        }
    },
    beforeMount() {
        this.req_findFishName();
    },
});



//--------------------------------VUE-Mount--------------------------------
vm.mount('#start-page');

//--------------------------------Register Service Worker and Subscribe to Push Notifications--------------------------------

// Don't register the service worker
// until the page has fully loaded
// window.addEventListener('load', async () => {
//     // Is service worker available?
//     if ('serviceWorker' in navigator) {
//         serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js')
//         console.log('SW registered!');
//     }

//     pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(publicKey) //'<Your Public Key from generateVAPIDKeys()>'
//     });
//     console.log(JSON.stringify(pushSubscription))
//         const response = await axios.post(`${URL_OceanService}/subscribe`, pushSubscription);
//         console.log(response.data);
//     // await fetch(`${URL_OceanService}/subscribe`, {
//     //     method : 'POST',
//     //     body: JSON.stringify(pushSubscription),
//     //     headers: {
//     //         'content-type' : 'application/json',
//     //         'credentials' : 'include'
//     //     }
//     // }).catch((err)=>{
//     //     console.log(err)
//     // })


// });

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};








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
if ('serviceWorker' in navigator) {

    console.log(navigator.serviceWorker);

    // serviceWorkerRegistration.update();
}