import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("ws://localhost:5001", {
  transports: ["websocket"],
  reconnectionAttempts: 3, 
  reconnectionDelay: 1000,
});

const VideoCall = ({ userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(new RTCPeerConnection());
  const [match, setMatch] = useState(null);

  useEffect(() => {
    socket.emit("join", { userId });

    socket.on("match-found", ({ match }) => {
      console.log("Match found:", match);
      setMatch(match);
    });

    socket.on("offer", async ({ offer, from }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { targetSocketId: from, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", ({ candidate }) => {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => socket.disconnect();
  }, [userId]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("offer", { targetSocketId: match.socketId, offer });
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video ref={localVideoRef} autoPlay playsInline className="w-1/2 border rounded-lg" />
      <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 border rounded-lg" />
      {match && <button onClick={startCall} className="mt-4 p-2 bg-blue-500 text-white">Start Call</button>}
    </div>
  );
};

export default VideoCall;
