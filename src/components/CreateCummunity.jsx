import { useState } from "react";
import { redirect } from "react-router-dom";

const CreateCommunity = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateCommunity = async () => {
    const token = localStorage.getItem("token");
    const creatorId = localStorage.getItem("userId"); 

    if (!token) {
      alert("Unauthorized! Please log in.");
      return;
    }

    const requestBody = { name, description, creatorId }; 
    console.log("Request Body:", requestBody); 

    const response = await fetch("http://localhost:5001/api/groups/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    alert("Community created successfully!");
    window.location.reload();
    window.location.href = "/profile";
    console.log("Response:", data); 
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create Community</h2>

      <input
        type="text"
        placeholder="Community Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
        rows="3"
      />

      <button
        onClick={handleCreateCommunity}
        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Create Community
      </button>
    </div>
  );
};

export default CreateCommunity;
