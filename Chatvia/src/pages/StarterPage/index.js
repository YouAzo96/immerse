import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBRObQEQeWWw9vI2jxBKTT9ezMvAv2B9Uk',
  authDomain: 'immerse-7a7fa.firebaseapp.com',
  projectId: 'immerse-7a7fa',
  storageBucket: 'immerse-7a7fa.appspot.com',
  messagingSenderId: '269807638089',
  appId: '1:269807638089:web:b47de2727d97c687729198',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
getToken(messaging, {
  vapidKey:
    'BJkzz3wT-CM3HybEfRL7WwhnZ-MEzCtaauLfiaIARJu4GUhx5jd9is1_blXVIqnYA3dV0iGVFidl8a',
})
  .then((currentToken) => {
    if (currentToken) {
      // Send the token to your backend for further use
      console.log('FCM Token:', currentToken);
    } else {
      console.log('No registration token available.');
    }
  })
  .catch((err) => {
    console.error('An error occurred while retrieving the FCM token:', err);
  });

function Index(props) {
  document.title =
    ' Starter Page | Immerse: Real-Time Chat App';
  return (
    <React.Fragment>
      <div>
        <h1>Push Notification Example</h1>
      </div>
    </React.Fragment>
  );
}

export default Index;
