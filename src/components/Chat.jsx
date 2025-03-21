import { useState, useEffect } from "react";
import axios from "axios";
import FriendsList from "./FriendList";
import ChatBox from "./ChatBox";

const Chat = () => {
    const [selectedFriend, setSelectedFriend] = useState(null);

    // Load previously selected friend on refresh
    useEffect(() => {
        const storedFriend = localStorage.getItem("selectedFriend");
        if (storedFriend) {
            setSelectedFriend(JSON.parse(storedFriend));
        }
    }, []);

    // Store selected friend in localStorage
    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        localStorage.setItem("selectedFriend", JSON.stringify(friend));
    };

    return (
        <div className="flex h-screen w-screen">
            {/* Friends List Panel */}
            <div className="w-1/4 bg-blue-200 p-4">
                <h2 className="text-lg font-bold mb-4 text-blue-800">Friends</h2>
                <FriendsList setSelectedFriend={handleSelectFriend} />
            </div>

            {/* Chat Box Panel */}
            <div className="w-[80%] bg-white p-4">
                {selectedFriend ? (
                    <ChatBox selectedFriend={selectedFriend} />
                ) : (
                    <p className="text-gray-500">Select a friend to start chatting</p>
                )}
            </div>
        </div>
    );
};

export default Chat;
