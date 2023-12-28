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



