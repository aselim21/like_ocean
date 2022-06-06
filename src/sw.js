self.addEventListener('install', (event) => {
    console.log("SW installed.")
});

self.addEventListener('activate', (event) => {
    console.log("SW activated.")
});

//   https://felixgerschau.com/web-push-notifications-tutorial/
self.addEventListener('push', (e) => {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
    });
});