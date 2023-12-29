import L from 'leaflet';
import {Workbox} from "workbox-window";


if ('serviceWorker' in navigator) {

    const wb = new Workbox('/serviceworker.js');

    wb.register().then(function (registration) {
        console.log('django-pwa: ServiceWorker registration successful with scope: ', registration.scope);

    }, function (err) {
        console.log('django-pwa: ServiceWorker registration failed: ', err);
    })
};

// Request permission
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    // Subscribe to push service
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BKAuhRXkQ97JADPegfqNFIpzVJq9ntXI3Hlbg4-5bMun0Derslx1MFx_M-wRll9wTYsrZ_MIOeTklqm2XDaLjxg",
      }).then((subscription) => {
          localStorage.setItem('subscription', JSON.stringify(subscription))
          // Send the subscription to your server
      });
    });
  }
});

window.sendSubscriptionToServer = async function (subscription, text) {
    // Use fetch or any other method to send the subscription data to your Django server
    const response = await fetch('/subscribe/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription: subscription, text: text }),
    });

    if (!response.ok) {
        console.error('Failed to send subscription data to server:', response.status, response.statusText);
    }
}



