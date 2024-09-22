import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './socketProvider.jsx';

const WebRTCContext = createContext();

export const useWebRTC = () => useContext(WebRTCContext);

const WebRTCProvider = ({ children }) => {
  const socket = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [caller, setCaller] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);

        // Handle incoming messages
        socket.on('receive-message', (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Other socket listeners (icecandidate, offer, answer, etc.)
        socket.on("icecandidate", async (candidate) => {
          if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socket.on("offer", async ({ fromSocketId, offer }) => {
          console.log("Offer received from:", fromSocketId);
          const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          setPeerConnection(pc);

          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          pc.ontrack = (event) => {
            const remoteVideo = document.getElementById("remoteVideo");
            remoteVideo.srcObject = event.streams[0];
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("icecandidate", event.candidate);
            }
          };

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { toSocketId: fromSocketId, answer: pc.localDescription });
          setCaller(fromSocketId);
        });

        socket.on("answer", async ({ fromSocketId, answer }) => {
          if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on("end-call", endCall);

      } catch (error) {
        console.error("Error initializing WebRTC:", error);
      }
    };

    initializeWebRTC();

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [peerConnection, socket]);

  const startCall = async (recipientSocketId) => {
    if (localStream) {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      setPeerConnection(pc);

      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      pc.ontrack = (event) => {
        const remoteVideo = document.getElementById("remoteVideo");
        remoteVideo.srcObject = event.streams[0];
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("icecandidate", event.candidate);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { from: socket.id, to: recipientSocketId, offer: pc.localDescription });
      setCaller(recipientSocketId);
    }
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
      setCaller(null);
    }
  };

  const sendMessageInGroup = (groupId, messageContent, senderSocketId) => {
    const message = { groupId, messageContent, senderSocketId};
    socket.emit('send-message-group', message);
    // Update local message state
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <WebRTCContext.Provider value={{ startCall, endCall, caller, sendMessageInGroup, messages }}>
      {children}
    </WebRTCContext.Provider>
  );
};

export default WebRTCProvider;
