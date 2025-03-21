window.global = window;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Signup from "./components/Signup";
import Profile from "./components/Profile"; // Example of a protected page
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./components/Chat";
import Homepage from "./pages/Homepage";
import FriendsProfile from "./components/FriendsProfile";
window.global = window;
function App() {
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
                    <Route path="/logout" element={<Logout />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
