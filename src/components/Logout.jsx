import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                await axios.post("http://localhost:5001/api/auth/logout");
            } catch (error) {
                console.error("Logout failed:", error.response?.data?.message);
            }

            // Clear token & redirect
            localStorage.removeItem("token");
            navigate("/login");
        };

        logoutUser();
    }, [navigate]);

    return <p>Logging out...</p>;
};

export default Logout;
