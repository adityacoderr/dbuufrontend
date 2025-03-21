import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const VideoCall = () => {
    const [hasMatched, setHasMatched] = useState(false);
    const [matchedUser, setMatchedUser] = useState(null); // Store the matched user
    const [localStream, setLocalStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socket = useRef(null);

    useEffect(() => {
        // Create a new socket connection
        socket.current = io("http://localhost:5001");

        // Listen for matchFound event
        socket.current.on("matchFound", handleMatchFound);

        return () => {
            // Close the socket connection on cleanup
            socket.current.close();
        };
    }, []);

    const handleMatchFound = (match) => {
        console.log("Match found:", match);
        setMatchedUser(match);
        setHasMatched(true);
    };

    const startMatching = async () => {
        if (!socket.current) return;

        // Replace 'gender' and 'interests' with actual values from user data
        const userData = {
            userId: "user123", // Replace with actual user ID
            gender: "female",  // Replace with actual gender
            interests: ["music", "sports"],  // Replace with actual interests
        };

        socket.current.emit("findMatch", userData);
    };

    const startVideoCall = async () => {
        if (!matchedUser) {
            console.error("No matched user found.");
            return;
        }

        try {
            // Get the user's media stream (video and audio)
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // Display the local video stream
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setLocalStream(stream);

            // Create a new peer connection for WebRTC
            const pc = new RTCPeerConnection();

            // Add tracks to the peer connection
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // Set up the ICE candidate handler
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.current.emit("ice-candidate", { candidate: event.candidate, to: matchedUser.socketId });
                }
            };

            // Set up the remote video stream
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            // Create an offer and set it as the local description
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send the offer to the matched user
            socket.current.emit("offer", { offer, to: matchedUser.socketId });
            setPeerConnection(pc); // Save the peer connection
        } catch (error) {
            console.error("Error starting video call:", error);
            if (error.name === "NotReadableError") {
                alert("The camera or microphone is already in use by another application.");
            }
        }
    };

    const handleOffer = async ({ offer, from }) => {
        const pc = new RTCPeerConnection();
        setPeerConnection(pc);

        // Get the user's media stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Set remote description (the offer)
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Create an answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send the answer back to the offerer
        socket.current.emit("answer", { answer, to: from });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current.emit("ice-candidate", { candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
    };

    const handleAnswer = ({ answer }) => {
        if (peerConnection) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const handleIceCandidate = ({ candidate }) => {
        if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    return (
        <div>
            <div>
                <video ref={localVideoRef} autoPlay muted></video>
            </div>
            <div>
                <video ref={remoteVideoRef} autoPlay></video>
            </div>
            {!hasMatched && (
                <button onClick={startMatching}>Start Matching</button>
            )}
            {hasMatched && (
                <button onClick={startVideoCall}>Start Video Call</button>
            )}
        </div>
    );
};

export default VideoCall;
