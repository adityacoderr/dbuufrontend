import React, { useEffect, useState } from "react";

const JoinCommunity = () => {
  const [groups, setGroups] = useState([]);
  const token = localStorage.getItem("token"); // Get JWT token
  const userId = localStorage.getItem("userId"); // Logged-in user's ID

  // Fetch all communities
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/groups/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [token]);

  const handleJoin = async (groupId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/groups/join/${groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }), 
      });

      const data = await response.json();
      if (response.ok) {
        alert("Joined successfully!");

        setGroups(groups.map(group => 
          group._id === groupId ? { ...group, members: [...group.members, userId] } : group
        ));
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Join a Community</h2>
      {groups.length === 0 ? (
        <p>No communities found.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group._id} className="flex justify-between items-center p-3 border-b">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-600">{group.description}</p>
                <p className="text-sm text-gray-500">Members: {group.members.length}</p>
              </div>
              {!group.members.includes(userId) ? (
                <button
                  onClick={() => handleJoin(group._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Join
                </button>
              ) : (
                <span className="text-green-500">Joined</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JoinCommunity;
