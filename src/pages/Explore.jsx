import { useEffect, useState } from "react";
import axios from "axios";

const Explore = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5001/api/explore/explore", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(res.data.users);
            } catch (error) {
                console.log("Error fetching users:", error.response?.data?.message);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="h-screen w-screen p-6 flex flex-col items-center bg-gradient-to-r from-blue-500 to-purple-600">
            <h2 className="text-3xl font-bold text-white mb-6">🌍 Explore People</h2>

            {users.length === 0 ? (
                <p className="text-white text-lg">No matching users found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className="bg-white p-6 rounded-xl shadow-lg w-64 text-center transform transition-all hover:scale-105 hover:shadow-2xl"
                        >
                            {user.profileImage ? (
                                <img
                                    src={`http://localhost:5001${user.profileImage}`}
                                    alt="Profile"
                                    className="w-28 h-28 rounded-full mx-auto border-4 border-blue-300"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
                                    <span className="text-gray-600">No Image</span>
                                </div>
                            )}

                            <h3 className="text-xl font-semibold text-gray-800 mt-4">{user.name}</h3>
                            <p className="text-blue-500 font-medium">@{user.username}</p>
                            <p className="text-gray-700 mt-1">🧑 Gender: {user.gender}</p>

                            <div className="mt-3">
                                <h4 className="text-gray-600 font-semibold">🎯 Interests</h4>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    {user.interests.map((interest, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Explore;
