import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const VideoCall = ({ user }) => {
    if (!user) return <div className="text-center text-gray-500">Loading...</div>;

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 text-white">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Interests Based Video Call</h2>

            <div className="flex gap-6">
                <div className="w-72 h-52 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                    <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
                </div>

                <div className="w-72 h-52 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                    <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover"></video>
                </div>
            </div>

            <div className="mt-6 flex gap-4">
                {!hasMatched ? (
                    <button
                        onClick={startMatching}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
                    >
                        Start Matching
                    </button>
                ) : (
                    <button
                        onClick={startVideoCall}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
                    >
                        Start Video Call
                    </button>
                )}

               
            </div>
            <p className="mt-4 text-black">We've added nudity detection to have safe content.</p>
            <p className="mt-4 text-black">Due to same system we can't use both camera at the same time. We can use only one camera. After deployment we can use both camera. Check console for more information.</p>
        </div>
    );
};

export default VideoCall;
