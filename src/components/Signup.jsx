import { useState } from "react";
import axios from "axios";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        gender: "",
        interests: [],
        profileImage: null, // Added profile image field
    });

    const handleChange = (e) => {
        if (e.target.name === "profileImage") {
            setFormData({ ...formData, profileImage: e.target.files[0] });
        } else if (e.target.name === "interests") {
            setFormData({ ...formData, interests: e.target.value.split(",") });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create FormData object to send profile image
        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);
        formDataObj.append("username", formData.username);
        formDataObj.append("email", formData.email);
        formDataObj.append("password", formData.password);
        formDataObj.append("gender", formData.gender);
        formDataObj.append("interests", JSON.stringify(formData.interests)); // Convert to JSON
        formDataObj.append("profileImage", formData.profileImage); // Append Image

        try {
            await axios.post("http://localhost:5001/api/auth/signup", formDataObj, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Signup successful!");
        } catch (err) {
            alert(err.response?.data?.message || "Signup failed!");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
            <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

            <select name="gender" onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>

            <input type="text" name="interests" placeholder="Interests (comma separated)" 
                onChange={handleChange} required />

            {/* Profile Image Upload */}
            <input type="file" name="profileImage" accept="image/*" onChange={handleChange} required />

            <button type="submit" className="bg-blue-500 text-white px-4 py-2">Sign Up</button>
        </form>
    );
};

export default Signup;
