// This optional code is used to register a service worker.
// register() is not called by default.

// const isLocalhost = Boolean(
//   window.location.hostname === 'localhost' ||
//     // [::1] is the IPv6 localhost address.
//     window.location.hostname === '[::1]' ||
//     // 127.0.0.0/8 are considered localhost for IPv4.
//     window.location.hostname.match(
//       /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
//     )
// );

// export function register(config) {
//   if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
//     // The URL constructor is available in all browsers that support SW.
//     const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
//     if (publicUrl.origin !== window.location.origin) {
//       console.log(`here : ${process.env.PUBLIC_URL}`);
//       // Our service worker won't work if PUBLIC_URL is on a different origin
//       // from what our page is served on. This might happen if a CDN is used to
//       // serve assets; see https://github.com/facebook/create-react-app/issues/2374
//       return;
//     }

//     window.addEventListener('load', () => {
//       const swUrl = `${process.env.PUBLIC_URL}/serviceWorker.js`;

//       if (isLocalhost) {
//         // This is running on localhost. Let's check if a service worker still exists or not.
//         checkValidServiceWorker(swUrl, config);

//         // Add some additional logging to localhost, pointing developers to the
//         // service worker/PWA documentation.
//         navigator.serviceWorker.ready.then(() => {
//           console.log(
//             'This web app is being served cache-first by a service ' + 'worker.'
//           );
//         });
//       } else {
//         // Is not localhost. Just register service worker
//         registerValidSW(swUrl, config);
//       }
//     });
//   }
// }

// function registerValidSW(swUrl, config) {
//   navigator.serviceWorker
//     .register(swUrl)
//     .then((registration) => {
//       // Handle push subscription

//       registration.onupdatefound = () => {
//         const installingWorker = registration.installing;
//         if (installingWorker == null) {
//           return;
//         }
//         installingWorker.onstatechange = () => {
//           if (installingWorker.state === 'installed') {
//             if (navigator.serviceWorker.controller) {
//               // At this point, the updated precached content has been fetched,
//               // but the previous service worker will still serve the older
//               // content until all client tabs are closed.
//               console.log(
//                 'New content is available and will be used when all ' +
//                   'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
//               );

//               // Execute callback
//               if (config && config.onUpdate) {
//                 config.onUpdate(registration);
//               }
//             } else {
//               // At this point, everything has been precached.
//               // It's the perfect time to display a
//               // "Content is cached for offline use." message.
//               console.log('Content is cached for offline use.');

//               // Execute callback
//               if (config && config.onSuccess) {
//                 config.onSuccess(registration);
//               }
//             }
//           }
//         };
//       };
//     })
//     .catch((error) => {
//       console.error('Error during service worker registration:', error);
//     });
// }

// function checkValidServiceWorker(swUrl, config) {
//   // Check if the service worker can be found. If it can't reload the page.
//   fetch(swUrl, {
//     headers: { 'Service-Worker': 'script' },
//   })
//     .then((response) => {
//       // Ensure service worker exists, and that we really are getting a JS file.
//       const contentType = response.headers.get('content-type');
//       if (
//         response.status === 404 ||
//         (contentType != null && contentType.indexOf('javascript') === -1)
//       ) {
//         // No service worker found. Probably a different app. Reload the page.
//         navigator.serviceWorker.ready.then((registration) => {
//           registration.unregister().then(() => {
//             window.location.reload();
//           });
//         });
//       } else {
//         // Service worker found. Proceed as normal.
//         registerValidSW(swUrl, config);
//       }
//     })
//     .catch(() => {
//       console.log(
//         'No internet connection found. App is running in offline mode.'
//       );
//     });
// }

// export function unregister() {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.ready
//       .then((registration) => {
//         registration.unregister();
//       })
//       .catch((error) => {
//         console.error(error.message);
//       });
//   }
// }

self.addEventListener('pushsubscriptionchange', (event) => {
  // Handle subscription change, e.g., update server with new subscription
});

self.addEventListener('message', (event) => {});

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

//WebPush Notifications:
self.addEventListener('push', (event) => {
  const payload = event.data.text();
  const notificationData = JSON.parse(payload);
  const message = notificationData.message;
  const eventType = notificationData.eventType;
  const UserWhoJustLoggedIn = notificationData.user_id;
  const options = {
    icon: './assets/images/favicon.ico',
    body: message,
  };
  if (eventType === 'contactAdded') {
    //refresh the app to get the new contact
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'REFRESH_APP' });
      });
    });
  }
  event.waitUntil(self.registration.showNotification('Immerse', options));
});

self.addEventListener('notificationclick', (event) => {
  // Handle notification clicks
  event.notification.close();
  event.waitUntil(clients.openWindow('http://localhost:3000/dashboard'));
});
