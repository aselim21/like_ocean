self.addEventListener('install', (event) => {
    console.log("SW installed...")

    self.registration.update();
});

self.addEventListener('activate', (event) => {
    console.log("SW activated.")
});

//   https://felixgerschau.com/web-push-notifications-tutorial/
self.addEventListener('push', (e) => {
    const data = e.data.json();
    console.log(e.data)
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        actions: data.actions,
        vibrate: data.vibrate,
        tag: data.tag,
        requireInteraction: data.requireInteraction

    });
});

self.addEventListener("notificationclick", e => {
    console.log('On notification click: ', e.notification.tag);
    const the_answer = e.title;
    // const the_action = e.action;
    e.notification.close();
    console.log(e)
    console.log(e.action);
    if(the_answer === 'Decline'){
       
    }else if(the_answer === 'Enter'){
        clients.openWindow(e.action);
    }
    
    // const uri = e.actions[0].action;
    // console.log(e.actions[0])
    // const notification = e.notification;
    // notification.close();
    // clients.openWindow(`${action}`);
});