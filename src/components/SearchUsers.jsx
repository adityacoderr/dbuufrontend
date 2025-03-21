import { useState } from "react";
import axios from "axios";
import UserCard from "./UserCard";
import AcceptFriendRequest from "./AcceptFriendRequest";

const SearchUsers = () => {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);

    const handleSearch = async () => {
        if (!query.trim()) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5001/api/user/search/${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }

            });
            setUsers(res.data);
        } catch (error) {
            console.log(error.response?.data?.message || "Error fetching users");
        }
    };
    
    

    return (
        <div className="p-4">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="border p-2 rounded w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
            </div>

            {users.length > 0 && (
                <div className="mt-4">
                {users.length > 0 ? (
                    users.map((user) => <UserCard key={user._id} user={user} />)
                ) : (
                    <p className="text-gray-500 mt-2">No users found.</p>
                )}
            </div>
            )}
        </div>
    );
};

export default SearchUsers;
