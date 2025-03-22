import { useEffect, useState } from "react";
import axios from "axios";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/groups/all");
        setGroups(res.data);
      } catch (error) {
        console.log("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const joinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5001/api/groups/join/${groupId}`, { userId });
      alert("Joined Group!");
    } catch (error) {
      console.log("Error joining group:", error);
    }
  };

  return (
    <div className=" p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Community Groups</h2>
      {groups.length === 0 ? (
        <p>No groups found.</p>
      ) : (
        <div className=" flex flex-col items-center justify-center">
          {groups.map((group) => (
            <div key={group._id} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{group.name}</h3>
              <p className="text-gray-600">{group.description}</p>
              <p className="text-sm text-gray-500">Members: {group.members.length}</p>
              <button
                onClick={() => joinGroup(group._id)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Join Group
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
