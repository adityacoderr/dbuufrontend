import { useEffect, useState } from "react";
import axios from "axios";

const FriendsList = ({ setSelectedFriend }) => {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5001/api/friends/friends", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFriends(res.data.friends);
            } catch (error) {
                console.log(error.response.data.message);
            }
        };

        fetchFriends();
    }, []);

    return (
        <ul>
            {friends.map((friend) => (
                <li
                    key={friend._id}
                    className="cursor-pointer text-black p-2 hover:bg-gray-200"
                    onClick={() => setSelectedFriend(friend)}
                >
                    {friend.name} 
                </li>
            ))}
        </ul>
    );
};

export default FriendsList;
