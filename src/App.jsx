window.global = window;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Signup from "./components/Signup";
import Profile from "./pages/Profile"; // Example of a protected page
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat";
import Homepage from "./pages/Homepage";
import FriendsProfile from "./components/FriendsProfile";
import Explore from "./pages/Explore";
import VideoCall from "./components/VideoCall";
window.global = window;
function App() {
    const [user, setUser] = useState(null);
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
            console.log(user);
        } catch (error) {
            console.log("Error fetching profile:", error.response?.data?.message);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, []);
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Homepage/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/logout" element={<Logout />} />
                
                {/* Protect all routes inside this */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:username" element={<FriendsProfile />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/match" element={<VideoCall user={user}/>} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/logout" element={<Logout />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
