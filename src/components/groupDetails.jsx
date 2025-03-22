import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const GroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [postContent, setPostContent] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/groups/${groupId}`);
        setGroup(res.data);
      } catch (error) {
        console.log("Error fetching group details:", error);
      }
    };

    fetchGroup();
  }, [groupId]);

  const addPost = async () => {
    try {
      await axios.post(`http://localhost:5001/api/groups/${groupId}/post`, {
        userId: localStorage.getItem("userId"),
        content: postContent,
      });
      alert("Post added!");
      setPostContent("");
    } catch (error) {
      console.log("Error posting:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      {group ? (
        <>
          <h2 className="text-2xl font-bold">{group.name}</h2>
          <p>{group.description}</p>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Posts</h3>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="block w-full border p-2 rounded-lg shadow-sm"
              placeholder="Write something..."
            />
            <button onClick={addPost} className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg">
              Post
            </button>
            {group.posts.map((post, index) => (
              <p key={index} className="mt-2 p-2 bg-gray-200 rounded">{post.content}</p>
            ))}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default GroupDetails;
