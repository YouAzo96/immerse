import React, { useEffect, useState } from 'react';
import Routes from './routes';
import io from 'socket.io-client';

// Import Scss
import './assets/scss/themes.scss';

// Selector and Redux setup
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

//Get STUN Servers:
const GEO_LOC_URL =
  'https://raw.githubusercontent.com/pradt2/always-online-stun/master/geoip_cache.txt';
const IPV4_URL =
  'https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_ipv4s.txt';
const GEO_USER_URL = 'https://geolocation-db.com/json/';
const geoLocs = await (await fetch(GEO_LOC_URL)).json();
const { latitude, longitude } = await (await fetch(GEO_USER_URL)).json();
const closestAddr = (await (await fetch(IPV4_URL)).text())
  .trim()
  .split('\n')
  .map((addr) => {
    const [stunLat, stunLon] = geoLocs[addr.split(':')[0]];
    const dist =
      ((latitude - stunLat) ** 2 + (longitude - stunLon) ** 2) ** 0.5;
    return [addr, dist];
  })
  .reduce(([addrA, distA], [addrB, distB]) =>
    distA <= distB ? [addrA, distA] : [addrB, distB]
  )[0];
console.log(closestAddr);

function App() {
  const selectLayoutProperties = createSelector(
    (state) => state.Layout,
    (layout) => ({
      layoutMode: layout.layoutMode,
    })
  );

  const { layoutMode } = useSelector(selectLayoutProperties);
  const [peerConnection, setPeerConnection] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authUser');
    if (socket && !token) {
      socket.disconnect();
      setSocket(null);
    } else if (!socket && token) {
      const newSocket = io('http://localhost:3001', {
        query: {
          userId: token,
        },
      });
      setSocket(newSocket);
    }

    // Clean up previous socket connection when component unmounts or token changes
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    // Initialize peer connection
    const initPeerConnection = async () => {
      const ICEConfig = {
        iceServers: [
          //{ urls: `stun:${closestAddr}` },
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:stun.stunprotocol.org:3478' },
          // Add more STUN or TURN servers as needed
        ],
      };
      const peerConnection = new RTCPeerConnection(ICEConfig);
      // Create an offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      // Send the offer to the server for signaling
      if (!socket) {
        return;
      }
      socket.emit('offer', {
        to: 'otherUserId', // Replace with the recipient's socket.id
        offer: offer,
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to the server
          socket.emit('ice-candidate', {
            to: 'otherUserId', // Replace with the recipient's socket.id
            iceCandidate: event.candidate,
          });
        }
      };

      setPeerConnection(peerConnection);
    };

    initPeerConnection();

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [peerConnection]);

  // Handle signaling events
  useEffect(() => {
    const handleOffer = (data) => {
      // Handle offer and create answer
      // Example: createAnswer();
    };

    const handleAnswer = async (data) => {
      // Handle answer
      await peerConnection.setRemoteDescription(data.answer);
    };

    const handleIceCandidate = async (data) => {
      // Add ICE candidate to peer connection
      await peerConnection.addIceCandidate(data.iceCandidate);
    };
    if (!socket) {
      return;
    }
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [socket]);

  useEffect(() => {
    layoutMode && localStorage.setItem('layoutMode', layoutMode);
  }, [layoutMode]);

  return <Routes />;
}

export default App;
