import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; 
import axios from "axios";

const FriendsProfile = () => {
    const { username } = useParams(); 
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found");
                    return;
                }
                const res = await axios.get(`http://localhost:5001/api/user/profile/${username}`,
                { headers: { Authorization: `Bearer ${token}`}} );
                setUser(res.data);
            } catch (error) {
                console.log("Error fetching profile:", error.response?.data?.message);
            }
        };

        fetchProfile();
    }, [username]); 

    console.log(user);
    return (
        <div className="h-screen w-screen p-4">
            {user ? (
                <div>
                    <img 
                        src={`http://localhost:5001${user.profileImage}`} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover"
                    />
                    <h2 className="text-xl font-bold mt-2">{user.name} (@{user.username})</h2>
                    <p className="text-gray-600">Gender: {user.gender}</p>
                    <p className="text-gray-600">Interests: {user.interests.join(", ")}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default FriendsProfile;
