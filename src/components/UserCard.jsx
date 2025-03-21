import { useState } from "react";
import axios from "axios";

const UserCard = ({ user }) => {
    const [requestSent, setRequestSent] = useState(false);

    const sendFriendRequest = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:5001/api/friends/send-request/${user._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequestSent(true);
        } catch (error) {
            console.log(error.response?.data?.message || "Error sending request");
        }
    };

    return (
        <div className="p-2 border-b flex justify-between items-center">
            <div>
                <p className="font-bold">Name - {user.name} </p>
                <p>Username - @{user.username}</p>
                <p className="text-sm text-gray-500">{user.gender}</p>
            </div>
            <button
                onClick={sendFriendRequest}
                className={`px-4 py-2 rounded ${requestSent ? "bg-gray-400" : "bg-green-500 text-white"}`}
                disabled={requestSent}
            >
                {requestSent ? "Request Sent" : "Send Request"}
            </button>
        </div>
    );
};

export default UserCard;
