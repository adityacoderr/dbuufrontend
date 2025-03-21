import axios from "axios";
import { useNavigate } from "react-router-dom";

const AcceptFriendRequest = async (senderId) => {
    try {
        const token = localStorage.getItem("token");
        await axios.post(`http://localhost:5001/api/friends/accept-request/${senderId}`, {}, {
            headers: { Authorization: token }
        });
        alert("Friend request accepted!");
    } catch (error) {
        alert(error.response.data.message);
    }
};

export default AcceptFriendRequest;