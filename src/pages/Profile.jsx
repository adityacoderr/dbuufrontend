import React from "react";
import Profile from "../components/Profile";
import { Link } from "react-router-dom";
import Groups from "../components/Groups";

const ProfilePage = () => {
  return (
    <div className="flex h-screen w-full">

      <div className="flex flex-col justify-start p-6 items-start h-full gap-6 w-[25%] bg-white shadow-md rounded-r-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Menu</h2>
        <Link to={"/chat"}>
          <button className="w-full px-5 py-2 text-black bg-blue-200 rounded-lg shadow-sm hover:bg-blue-300 transition">
            💬 Chat
          </button>
        </Link>
        <Link to={"/explore"}>
          <button className="w-full px-5 py-2 text-black bg-green-200 rounded-lg shadow-sm hover:bg-green-300 transition">
            🔍 Explore
          </button>
        </Link>
        <Link to={"/match"}>
          <button className="w-full px-5 py-2 text-black bg-yellow-200 rounded-lg shadow-sm hover:bg-yellow-300 transition">
            ❤️ Start VideoCall
          </button>
        </Link>
        <Link to={"/cummunity"}>
          <button className="w-full px-5 py-2 text-black bg-pink-200 rounded-lg shadow-sm hover:bg-pink-300 transition">
            🎉 Create Cummunity
          </button>
        </Link>
        <Groups />
      </div>

      {/* Profile Section */}
      <div className="flex justify-center items-center h-full w-[88%] ">
        <Profile />
      </div>
      </div>
  );
};

export default ProfilePage;
