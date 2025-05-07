// import React, { useEffect, useState } from "react";
// import { auth, db } from "./firebase";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { Input, Button, message, Spin } from "antd";
// import aboutShape1 from "../assets/images/about-shape-1.svg";
// import aboutShape2 from "../assets/images/about-shape-2.svg";
// import "./Profile.css";

// function Profile() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     bio: "",
//   });

//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");

//   // Fetch user data on mount
//   useEffect(() => {
//     const fetchUserData = async () => {
//       const user = auth.currentUser;
//       if (user) {
//         try {
//           const userRef = doc(db, "users", user.uid);
//           const docSnap = await getDoc(userRef);
//           if (docSnap.exists()) {
//             setFormData(docSnap.data());
//           } else {
//             setError("No profile data found.");
//           }
//         } catch (err) {
//           console.error("Error fetching user data:", err);
//           setError("Failed to load user data.");
//         }
//       } else {
//         setError("User not logged in.");
//       }
//       setLoading(false);
//     };

//     fetchUserData();
//   }, []);

//   // Handle form input change
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setSuccess("");
//     setError("");
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.name || !formData.email) {
//       setError("Name and Email are required");
//       return;
//     }

//     const user = auth.currentUser;
//     if (!user) {
//       setError("User not authenticated");
//       return;
//     }

//     setUploading(true);
//     try {
//       const userRef = doc(db, "users", user.uid);
//       await setDoc(userRef, formData, { merge: true });

//       setSuccess("Profile updated successfully!");
//       message.success("Profile saved.");
//     } catch (error) {
//       console.error("Upload failed:", error);
//       setError("Something went wrong. Try again.");
//       message.error("Save failed.");
//     }
//     setUploading(false);
//   };

//   return (
//     <div className="profile-wrapper">
//       <img src={aboutShape2} alt="TopShape" className="TopShape" />

//       <div className="profile-card">
//         <h2 className="profile-title">Your Profile</h2>

//         {loading ? (
//           <Spin tip="Loading profile..." />
//         ) : (
//           <>
//             {success && <p className="profile-success">{success}</p>}
//             {error && <p className="profile-error">{error}</p>}
//             {uploading && (
//               <div className="profile-uploading">
//                 <Spin />
//                 Saving data...
//               </div>
//             )}

//             <form className="profile-form" onSubmit={handleSubmit}>
//               <Input
//                 type="text"
//                 name="name"
//                 placeholder="Full Name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="profile-input"
//               />
//               <Input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="profile-input"
//               />
//               <Input.TextArea
//                 name="bio"
//                 placeholder="Write something about yourself..."
//                 value={formData.bio}
//                 onChange={handleChange}
//                 className="profile-textarea"
//                 rows={4}
//               />
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 className="profile-button"
//                 disabled={uploading}
//               >
//                 {uploading ? "Saving..." : "Save Changes"}
//               </Button>
//             </form>
//           </>
//         )}
//       </div>

//       <img src={aboutShape1} alt="BottomShape" className="BottomShape" />
//     </div>
//   );
// }

// export default Profile;


import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Input, Button, message, Spin, Tabs, List, Card } from "antd";
import aboutShape1 from "../assets/images/about-shape-1.svg";
import aboutShape2 from "../assets/images/about-shape-2.svg";
import "./Profile.css";

const { TabPane } = Tabs;

const getYouTubeData = (url) => {
  // Extract video ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  
  if (!videoId) return null;
  
  return {
    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`
  };
};

function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch user data and history on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Fetch profile data
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setFormData(docSnap.data());
          } else {
            setError("No profile data found.");
          }

          // Fetch user history
          await fetchUserHistory(user.uid);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data.");
        }
      } else {
        setError("User not logged in.");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Fetch user's video analysis history
  const fetchUserHistory = async (userId) => {
    setHistoryLoading(true);
    try {
      const historyRef = collection(db, "userVideos");
      const q = query(historyRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate()?.toLocaleString() || "Unknown date"
        });
      });
      
      // Sort by date (newest first)
      history.sort((a, b) => new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate()));
      setUserHistory(history);
    } catch (err) {
      console.error("Error fetching user history:", err);
      message.error("Failed to load history");
    }
    setHistoryLoading(false);
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess("");
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError("Name and Email are required");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setUploading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, formData, { merge: true });

      setSuccess("Profile updated successfully!");
      message.success("Profile saved.");
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Something went wrong. Try again.");
      message.error("Save failed.");
    }
    setUploading(false);
  };

  return (
    <div className="profile-wrapper">
      <img src={aboutShape2} alt="TopShape" className="TopShape" />

      <div className="profile-card">
        <h2 className="profile-title">Your Account</h2>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="profile-tabs"
        >
          <TabPane tab="Profile" key="profile">
            {loading ? (
              <Spin tip="Loading profile..." />
            ) : (
              <>
                {success && <p className="profile-success">{success}</p>}
                {error && <p className="profile-error">{error}</p>}
                {uploading && (
                  <div className="profile-uploading">
                    <Spin />
                    Saving data...
                  </div>
                )}

                <form className="profile-form" onSubmit={handleSubmit}>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="profile-input"
                  />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="profile-input"
                  />
                  <Input.TextArea
                    name="bio"
                    placeholder="Write something about yourself..."
                    value={formData.bio}
                    onChange={handleChange}
                    className="profile-textarea"
                    rows={4}
                  />
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="profile-button"
                    disabled={uploading}
                  >
                    {uploading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </>
            )}
          </TabPane>

          <TabPane tab="History" key="history">
            {historyLoading ? (
              <Spin tip="Loading history..." />
            ) : (
              <div className="history-container">
                <h3 className="history-title">Your Video Analysis History</h3>
                
                {userHistory.length === 0 ? (
                  <p className="history-empty">No history found. Analyze some videos to see them here!</p>
                ) : (
                  <div className="video-grid">
                    {userHistory.map((item) => {
                      const youtubeData = getYouTubeData(item.videoUrl);
                      
                      return (
                        <Card 
                          key={item.id} 
                          className="video-card"
                          hoverable
                          cover={
                            youtubeData ? (
                              <img 
                                alt="Video thumbnail" 
                                src={youtubeData.thumbnail} 
                                className="video-thumbnail"
                              />
                            ) : (
                              <div className="video-thumbnail-placeholder">
                                <span>Video Preview</span>
                              </div>
                            )
                          }
                        >
                          <div className="video-info">
                            <h4 className="video-title">
                              <a 
                                href={youtubeData?.watchUrl || item.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {youtubeData ? "YouTube Video" : "External Video"}
                              </a>
                            </h4>
                            <p className="video-date">Analyzed: {item.date}</p>
                            <div className="video-actions">
                              <Button 
                                type="primary" 
                                onClick={() => window.open(item.videoUrl, '_blank')}
                              >
                                View Analysis
                              </Button>
                              {youtubeData && (
                                <Button 
                                  type="default"
                                  onClick={() => window.open(youtubeData.watchUrl, '_blank')}
                                >
                                  Watch on YouTube
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>

      <img src={aboutShape1} alt="BottomShape" className="BottomShape" />
    </div>
  );
}

export default Profile;
