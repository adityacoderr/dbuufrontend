import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import SearchUsers from "./SearchUsers";
import VideoCall from "./VideoCall";

const socket = io("http://localhost:5001", { transports: ["websocket"] });

const Profile = () => {
    const [user, setUser] = useState(null);
    const [friendRequests, setFriendRequests] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [image, setImage] = useState(null); // Image file state
    const [description, setDescription] = useState(""); // Description state
    const [uploadStatus, setUploadStatus] = useState(""); // Status message
    const [posts, setPosts] = useState([]); // To store and display posts (uploaded images)

    const username = localStorage.getItem("username");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found");
                    return;
                }
                const res = await axios.get("http://localhost:5001/api/user/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (error) {
                console.log("Error fetching profile:", error.response?.data?.message);
            }
        };

        const fetchFriendRequests = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5001/api/friends/friend-requests", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFriendRequests(res.data.friendRequests);
            } catch (error) {
                console.log("Error fetching friend requests:", error.response?.data?.message);
            }
        };

        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found");
                    return;
                }

                const res = await axios.get(`http://localhost:5001/api/post/posts/${user?._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(res.data);
                setPosts(res.data.posts); // Set posts in the state
            } catch (error) {
                console.log("Error fetching posts:", error.response?.data?.message);
            }
        };

        fetchProfile();
        fetchFriendRequests();
        fetchPosts();

        // Emit event when user is online
        if (username) {
            socket.emit("user-online", username);
        }

        // Listen for online user updates
        socket.on("update-online-users", (count) => {
            setOnlineUsers(count);
        });

        // Cleanup on unmount
        return () => {
            socket.emit("user-offline", username);
            socket.off("update-online-users");
        };
    }, [username, user?._id]); // Added `user?._id` as a dependency to refetch posts when the user changes

    const handleAccept = async (senderId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:5001/api/friends/accept-request/${senderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFriendRequests(friendRequests.filter(request => request._id !== senderId));
        } catch (error) {
            console.log("Error accepting request:", error.response?.data?.message);
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleImageUpload = async () => {
        if (!image) {
            setUploadStatus("Please select an image to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("image", image);
        formData.append("userId", user?._id);
        formData.append("description", description); // Add description to form data

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:5001/api/post/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setUploadStatus("Image uploaded successfully.");
            setPosts([...posts, res.data.image]); // Add the uploaded image to the posts list
            console.log(res.data);

            // Reset the image and description after upload
            setImage(null);
            setDescription("");
        } catch (error) {
            setUploadStatus("Error uploading image.");
        }
    };

    return (
        <div className="h-screen w-screen p-4 flex flex-col items-center">
            <SearchUsers />
            {/* <VideoCall userId={user?._id} /> */}

            {/* Online Users Display */}
            <div className="mt-2 text-lg font-bold text-green-600">
                Online Users: {onlineUsers}
            </div>

            {/* Profile Information */}
            {user && (
                <div className="text-center">
                    <h2 className="text-lg font-bold">{user.name}</h2>
                    <p className="text-gray-600">@{user.username}</p>

                    {user.profileImage ? (
                        <img
                            src={`http://localhost:5001${user.profileImage}`}
                            alt="Profile"
                            className="w-44 h-44 rounded-full mt-2"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mt-2">
                            <span className="text-gray-600">No Image</span>
                        </div>
                    )}

                    <p className="mt-2">Gender: {user.gender}</p>
                    <p>Interests: {user.interests.join(", ")}</p>
                </div>
            )}

            <div className="mt-4 w-full max-w-md">
                <h3 className="text-lg font-bold">Upload Post</h3>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="block w-full border border-gray-300 p-2 mt-2"
                />
                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Write a description..."
                    className="block w-full border border-gray-300 p-2 mt-2"
                    rows="3"
                />
                <button 
                    onClick={handleImageUpload} 
                    className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
                >
                    Upload
                </button>
                {uploadStatus && <p className="mt-2">{uploadStatus}</p>}
            </div>

            <div className="mt-4 w-full max-w-md">
                <h3 className="text-lg font-bold">Your Posts</h3>
                {posts.length === 0 ? (
                    <p>No posts uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {posts.map((post) => (
                            <div key={post._id} className="w-full h-32 overflow-hidden rounded-lg">
                                <img
                                    src={`http://localhost:5001/${post.path}`}
                                    alt="Post"
                                    className="w-full h-full object-cover"
                                />
                                <p className="mt-2 text-sm text-red-700">{post?.description}</p> 
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Friend Requests */}
            {friendRequests.length > 0 && (
                <div className="mt-4 w-full max-w-md">
                    <h3 className="text-lg font-bold">Friend Requests</h3>
                    {friendRequests.map((req) => (
                        <div key={req._id} className="border p-4 mb-2 flex justify-between items-center">
                            <p>{req.name} (@{req.username})</p>
                            <button
                                className="bg-green-500 text-white px-2 py-1 rounded"
                                onClick={() => handleAccept(req._id)}
                            >
                                Accept
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Profile;
