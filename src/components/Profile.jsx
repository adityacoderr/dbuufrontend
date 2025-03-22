import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import SearchUsers from "./SearchUsers";

const socket = io("http://localhost:5001", { transports: ["websocket"] });

// There are neccessery comments below to understand the code- inserted by WL-CODERRS

const Profile = () => {
    const [user, setUser] = useState(null);
    const [friendRequests, setFriendRequests] = useState([]);
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");
    const [posts, setPosts] = useState([]);

    const username = localStorage.getItem("username");

    // Fetch User Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found");
                    return;
                }
                const res = await axios.get("http://localhost:5001/api/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(res.data);
            } catch (error) {
                console.log("Error fetching profile:", error.response?.data?.message);
            }
        };

        fetchProfile();

        if (username) {
            socket.emit("user-online", username);
        }

        return () => {
            socket.emit("user-offline", username);
        };
    }, [username]);
    // Fetch Friend Requests
    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await axios.get("http://localhost:5001/api/friends/friend-requests", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setFriendRequests(res.data.requests);
            } catch (error) {
                console.log("Error fetching friend requests:", error.response?.data?.message);
            }
        };

        fetchFriendRequests();
    }, []);


    // Fetch Posts after user is set
    useEffect(() => {
        if (!user?._id) return;
        localStorage.setItem("userId", user._id);

        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await axios.get(`http://localhost:5001/api/post/posts/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPosts(res.data.posts);
            } catch (error) {
                console.log("Error fetching posts:", error.response?.data?.message);
            }
        };

        fetchPosts();
    }, [user]);

    // Accept Friend Request Function
    const AcceptFriendRequest = async (senderId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:5001/api/friends/accept-request/${senderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Friend request accepted!");
        } catch (error) {
            alert(error.response?.data?.message);
        }
    };

    const handleImageUpload = async () => {
        if (!image) {
            setUploadStatus("Please select an image.");
            return;
        }

        const formData = new FormData();
        formData.append("image", image);
        formData.append("userId", user?._id);
        formData.append("description", description);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:5001/api/post/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setUploadStatus("Image uploaded successfully.");
            setPosts([...posts, res.data.post]); 
            setImage(null);
            setDescription("");
        } catch (error) {
            setUploadStatus("Error uploading image.");
        }
    };

    return (
        <div className="max-w-5xl w-full h-full p-4 mx-auto bg-purple-100 shadow-lg rounded-xl overflow-auto">
            <div className="grid grid-cols-3 gap-8">
                {/* Profile Info (Left) */}
                <div className="col-span-1 bg-gradient-to-br from-white to-gray-100 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Profile</h2>
                    {user && (
                        <div className="text-center">
                            <img
                                src={user.profileImage ? `http://localhost:5001${user.profileImage}` : "/default-avatar.png"}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-500 shadow-md"
                            />
                            <h3 className="text-xl font-semibold mt-4 text-gray-900">{user.name}</h3>
                            <p className="text-gray-600">@{user.username}</p>
                            <p className="mt-2 font-medium text-gray-700">
                                Gender: <span className="bg-blue-100 px-2 py-1 rounded-full text-blue-700 shadow-md"> {user.gender}</span>
                            </p>

                            {/* Interests */}
                            <div className="mt-4">
                                <h4 className="text-lg font-semibold mb-2 text-gray-800">Interests</h4>
                                <h5 className="text-md font-semibold mb-2 text-gray-800 mb-4">
                                    Friends Count{" "}
                                    <span className="bg-blue-100 px-2 py-1 rounded-full text-blue-700 shadow-md">
                                        {user.friends?.length}
                                    </span>
                                </h5>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {user.interests.map((interest, index) => (
                                        <span key={index} className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 shadow-md">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Post Section */}
                    <div className="mt-8 p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Upload Post</h3>
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="block w-full border p-2 mb-2 rounded-lg shadow-sm" />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Write a description..."
                            className="block w-full border p-2 mb-2 rounded-lg shadow-sm"
                            rows="3"
                        />
                        <button
                            onClick={handleImageUpload}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                        >
                            Upload
                        </button>
                        {uploadStatus && <p className="mt-2 text-sm text-gray-600">{uploadStatus}</p>}
                    </div>
                </div>


                {/* Posts (Right) */}
                <div className="col-span-2">
                    <SearchUsers />
                    {/* Friend Requests Section */}
                    {friendRequests?.length > 0 && (
                        <div className="mt-8 p-6 bg-white shadow-lg rounded-lg">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">Incoming Friend Requests</h3>
                            <div className="space-y-4">
                                {friendRequests.map((request) => (
                                    <div key={request.senderId} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-md">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={request.senderProfileImage ? `http://localhost:5001${request.senderProfileImage}` : "/default-avatar.png"}
                                                alt="Sender"
                                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                            />
                                            <span className="text-gray-800 font-semibold">@{request.senderUsername}</span>
                                        </div>
                                        <button
                                            onClick={() => AcceptFriendRequest(request.senderId)}
                                            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Posts</h3>
                    {posts.length === 0 ? (
                        <p className="text-gray-500">No posts uploaded yet.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {posts.map((post, index) => (
                                <div key={index} className="relative rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105">
                                    <img
                                        src={`http://localhost:5001/${post.path}`}
                                        alt="Post"
                                        className="w-full h-56 object-cover"
                                    />
                                    <p className="absolute bottom-0 bg-purple-200 bg-opacity-50 text-black text-sm p-2 w-full">{post.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
