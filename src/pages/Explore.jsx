import { useEffect, useState } from "react";
import axios from "axios";

const Explore = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5001/api/explore/explore", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(res.data.users);
                console.log(res.data);
            } catch (error) {
                console.log("Error fetching users:", error.response?.data?.message);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="h-screen w-screen p-4 flex flex-col items-center bg-gray-600">
            <h2 className="text-2xl font-bold text-white mb-4">Explore People</h2>

            {users.length === 0 ? (
                <p className="text-white">No matching users found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {users.map((user) => (
                        <div key={user._id} className="bg-white p-4 rounded-lg shadow-lg w-60">
                            {user.profileImage ? (
                                <img
                                    src={`http://localhost:5001${user.profileImage}`}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full mx-auto"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
                                    <span className="text-gray-600">No Image</span>
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-center mt-2">{user.name}</h3>
                            <p className="text-gray-600 text-center">@{user.username}</p>
                            <p className="text-gray-700 text-center">Gender: {user.gender}</p>
                            <p className="text-gray-700 text-center">
                                Interests: {user.interests.join(" ")}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Explore;
