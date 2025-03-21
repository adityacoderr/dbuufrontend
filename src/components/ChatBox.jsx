import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

const ChatBox = ({ selectedFriend }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [userId, setUserId] = useState(null);
    const chatContainerRef = useRef(null);
    const isAtBottomRef = useRef(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setUserId(decoded.id);
        }
    }, []);

    const fetchMessages = async () => {
        if (!selectedFriend) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5001/api/chat/${selectedFriend._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(res.data);
        } catch (error) {
            console.log("Error fetching messages:", error.response?.data?.message);
        }
    };

    useEffect(() => {
        if (!selectedFriend) return;

        fetchMessages();

        const interval = setInterval(() => {
            fetchMessages();
        }, 2000);

        return () => clearInterval(interval);
    }, [selectedFriend]);

    useEffect(() => {
        if (isAtBottomRef.current) {
            chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const handleScroll = () => {
        if (!chatContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        isAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 10;
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5001/api/chat/send",
                { receiverId: selectedFriend._id, message: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newMsg = {
                sender: userId,
                text: newMessage,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, newMsg]);
            setNewMessage("");

            if (isAtBottomRef.current) {
                setTimeout(() => {
                    chatContainerRef.current?.scrollTo({
                        top: chatContainerRef.current.scrollHeight,
                        behavior: "smooth",
                    });
                }, 100);
            }
        } catch (error) {
            console.log("Error sending message:", error.response?.data?.message);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-lg font-bold p-2 border-b bg-blue-100 text-black text-center">
                {selectedFriend.name}
            </h2>

            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-2"
            >
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === userId ? "justify-end" : "justify-start"}`}>
                        <div className={`p-2 rounded-lg max-w-xs ${msg.sender === userId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                            <p>{msg.text}</p>
                            <span className="text-xs text-gray-600 block mt-1 text-right">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-2 border-t flex text-black ">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown} 
                />
                <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
