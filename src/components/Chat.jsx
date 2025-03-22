import { useState, useEffect } from "react";
import FriendsList from "./FriendList";
import ChatBox from "./ChatBox";

const Chat = () => {
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
        const storedFriend = localStorage.getItem("selectedFriend");
        if (storedFriend) {
            setSelectedFriend(JSON.parse(storedFriend));
        }
    }, []);

    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        localStorage.setItem("selectedFriend", JSON.stringify(friend));
    };

    return (
        <div className="flex h-screen w-screen bg-gray-100">
            {/* Friends List Sidebar */}
            <div className="w-1/4 bg-blue-200 p-4 text-white shadow-lg flex flex-col">
                <h2 className="text-xl text-black font-bold mb-4 text-center">Friends</h2>
                <FriendsList setSelectedFriend={handleSelectFriend} />
            </div>

            {/* Chat Box */}
            <div className="flex-1 bg-white flex flex-col items-center justify-center p-4 shadow-lg">
                {selectedFriend ? (
                    <ChatBox selectedFriend={selectedFriend} />
                ) : (
                    <p className="text-gray-500 text-lg">Select a friend to start chatting</p>
                )}
            </div>
        </div>
    );
};

export default Chat;
