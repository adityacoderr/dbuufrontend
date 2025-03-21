import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const VideoCall = ({ user }) => {
    if (!user) return <div>Loading...</div>;

    const [hasMatched, setHasMatched] = useState(false);
    const [matchedUser, setMatchedUser] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [room, setRoom] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socket = useRef(null);

    const userId = user._id;
    const gender = user.gender;
    const interests = user.interests;

    useEffect(() => {
        socket.current = io("http://localhost:5001");

        socket.current.on("matchFound", ({ matchedUser, socketId, room }) => {
            console.log("Matched with:", matchedUser);
            setMatchedUser({ userId: matchedUser, socketId });
            setRoom(room);
            setHasMatched(true);
        });

        socket.current.on("offer", handleOffer);
        socket.current.on("answer", handleAnswer);
        socket.current.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const startMatching = () => {
        if (!socket.current) return;

        socket.current.emit("findMatch", { userId, gender, interests });
    };

    const startVideoCall = async () => {
        if (!matchedUser) {
            console.error("No matched user found.");
            return;
        }

        console.log("Waiting 10 seconds before starting the call...");
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setLocalStream(stream);

            const pc = new RTCPeerConnection();
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.current.emit("ice-candidate", { candidate: event.candidate, to: matchedUser.socketId });
                }
            };

            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.current.emit("offer", { offer, to: matchedUser.socketId });
            setPeerConnection(pc);
        } catch (error) {
            console.error("Error starting video call:", error);
        }
    };

    const handleOffer = async ({ offer, from }) => {
        const pc = new RTCPeerConnection();
        setPeerConnection(pc);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.current.emit("answer", { answer, to: from });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current.emit("ice-candidate", { candidate: event.candidate, to: from });
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
