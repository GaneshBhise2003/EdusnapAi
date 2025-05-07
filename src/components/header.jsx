// import React, { useEffect, useState } from 'react';
// import '../App.css';

// const Header = () => {
//   const baseURL = process.env.PUBLIC_URL + '/assets/images';
//   const [videoUrl, setVideoUrl] = useState('');
//   const [videoFile, setVideoFile] = useState(null);

//   useEffect(() => {
//     if (window.particlesJS) {
//       window.particlesJS('particles-1', {
//         particles: {
//           number: {
//             value: 80,
//             density: { enable: true, value_area: 800 },
//           },
//           color: { value: '#ffffff' },
//           shape: {
//             type: 'circle',
//             stroke: { width: 0, color: '#000000' },
//             polygon: { nb_sides: 5 },
//           },
//           opacity: {
//             value: 0.5,
//             random: false,
//             anim: { enable: false },
//           },
//           size: {
//             value: 3,
//             random: true,
//             anim: { enable: false },
//           },
//           line_linked: {
//             enable: true,
//             distance: 150,
//             color: '#ffffff',
//             opacity: 0.4,
//             width: 1,
//           },
//           move: {
//             enable: true,
//             speed: 2,
//             direction: 'none',
//             random: false,
//             straight: false,
//             out_mode: 'out',
//             bounce: false,
//           },
//         },
//         interactivity: {
//           detect_on: 'canvas',
//           events: {
//             onhover: { enable: true, mode: 'repulse' },
//             onclick: { enable: true, mode: 'push' },
//             resize: true,
//           },
//           modes: {
//             grab: { distance: 400, line_linked: { opacity: 1 } },
//             bubble: { distance: 400, size: 40, duration: 2, opacity: 8 },
//             repulse: { distance: 100 },
//             push: { particles_nb: 4 },
//             remove: { particles_nb: 2 },
//           },
//         },
//         retina_detect: true,
//       });
//     }
//   }, []);

//   const handleFileChange = (e) => {
//     setVideoFile(e.target.files[0]);
//     setVideoUrl('');
//   };

//   const handleAnalyze = () => {
//     if (videoUrl) {
//       console.log('Analyzing video from URL:', videoUrl);
//       // Add your logic for analyzing video via URL here
//     } else if (videoFile) {
//       console.log('Analyzing video from file:', videoFile);
//       // Add your logic for analyzing uploaded file here
//     } else {
//       alert('Please provide a video URL or upload a file.');
//     }
//   };

//   return (
//     <header className="header-area">
//       <div className="navbar-area">
//         <div className="container relative">
//           <div className="row">
//             <div className="w-full">
//               <nav className="flex items-center justify-between navbar navbar-expand-lg">
//                 <a className="mr-4 navbar-brand" href="/">
//                   <img src={`${baseURL}/logo4.png`} alt="Logo" className="h-24 w-auto" />
//                 </a>
//                 <button className="block navbar-toggler focus:outline-none lg:hidden">
//                   <span className="toggler-icon"></span>
//                   <span className="toggler-icon"></span>
//                   <span className="toggler-icon"></span>
//                 </button>
//                 <div className="hidden lg:block navbar-collapse">
//                   <ul className="flex space-x-6">
//                     <li><a href="#home" className="text-white">Home</a></li>
//                     <li><a href="#features" className="text-white">Features</a></li>
//                     <li><a href="#about" className="text-white">About</a></li>
//                     <li><a href="#facts" className="text-white">Why</a></li>
//                     <li><a href="#team" className="text-white">Team</a></li>
//                     <li><a href="#blog" className="text-white">Blog</a></li>
//                   </ul>
//                 </div>
//                 <div className="hidden lg:block navbar-btn">
//                   <a href="#" className="main-btn gradient-btn">Login</a>
//                 </div>
//               </nav>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div
//         id="home"
//         className="header-hero relative"
//         style={{ backgroundImage: `url(${baseURL}/banner-bg.svg)` }}
//       >
//         <div className="container relative z-10">
//           <div className="text-center pt-32 lg:pt-48">
//             <h3 className="text-4xl font-light text-white">EduSnap AI</h3>
//             <h2 className="text-4xl font-bold text-white my-3">Enhance Learning with Smart Video Analysis</h2>
//             <p className="text-white mb-8">Upload or paste a lecture video to get started.</p>
//           </div>

//           {/* Video Upload Container */}
//           <div className="mt-12 mx-auto max-w-3xl backdrop-blur-md bg-white/20 p-8 rounded-3xl shadow-2xl text-center border border-white/30">
//             <h4 className="mb-4 text-2xl font-semibold text-white drop-shadow-md">Upload or Paste Lecture Video</h4>

//             {/* Paste URL */}
//             <input
//               type="text"
//               placeholder="Paste video URL (mp4)"
//               className="w-full mb-6 px-5 py-3 text-white bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm transition-all duration-300 placeholder-white/80"
//               value={videoUrl}
//               onChange={(e) => {
//                 setVideoUrl(e.target.value);
//                 setVideoFile(null);
//               }}
//             />

//             {/* OR Upload Local Video */}
//             <div className="mb-6">
//               <label className="block mb-2 text-white font-medium">Or upload a .mp4 file:</label>
//               <input
//                 type="file"
//                 accept="video/mp4"
//                 onChange={handleFileChange}
//                 className="w-full file:px-4 file:py-2 file:border-0 file:rounded-lg file:bg-gradient-to-r file:from-indigo-500 file:to-purple-500 file:text-white file:font-semibold text-white cursor-pointer"
//               />
//             </div>

//             {/* Analyze Button */}
//             <button
//               onClick={handleAnalyze}
//               className="mt-4 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
//             >
//               Analyze Video
//             </button>
//           </div>
//         </div>

//         {/* Particle canvas */}
//         <div id="particles-1" className="particles absolute top-0 left-0 w-full h-full z-0"></div>
//       </div>
//     </header>
//   );
// };

// export default Header

////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////working----------------------------(1)

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import "../App.css";
import { message } from 'antd'; // Add this import at the top with other imports
import { ChevronDownIcon } from '@heroicons/react/24/outline';  // Updated import path
const Header = () => {
  const baseURL = process.env.PUBLIC_URL + "/assets/images";
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [user, setUser] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [userUrls, setUserUrls] = useState([]);

  const navigate = useNavigate();

  // Listen to auth state changes
  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserUrls(currentUser.uid); // Load user's saved videos
      } else {
        setUserUrls([]); // Clear saved videos if logged out
      }
    });
  
    return () => unsubscribe(); // Cleanup on unmount
  }, []); // Empty dependency array = runs once on mount

  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS("particles-1", {
        particles: {
          number: {
            value: 30,  // Fewer bubbles for a cleaner look
            density: { enable: false } // Disable density for more spread-out bubbles
          },
          color: {
            value: "#ffffff" // White bubbles (can change to any color)
          },
          shape: {
            type: "circle", // Bubbles are circles
          },
          opacity: {
            value: 0.5,  // Semi-transparent
            random: true, // Some bubbles more/less transparent
          },
          size: {
            value: 20,  // Bigger bubbles (instead of tiny dots)
            random: true, // Random sizes for natural look
          },
          line_linked: {
            enable: false, // Disable connecting lines (only bubbles)
          },
          move: {
            enable: true,
            speed: 1,  // Slower, floating motion
            direction: "none",
            random: true,  // Random movement
            straight: false,
            out_mode: "bounce",  // Bubbles bounce off edges
            bounce: true,
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "bubble"  // Bubbles react to hover
            },
            onclick: {
              enable: true,
              mode: "push"  // Click creates new bubbles
            }
          },
          modes: {
            bubble: {
              distance: 100,
              size: 10,
              duration: 2,
              opacity: 0.8,
            },
            push: {
              particles_nb: 3  // Adds bubbles on click
            }
          }
        },
        retina_detect: true
      });
    }
  }, []);

  // Fetch user's saved URLs from Firestore
  const fetchUserUrls = async (userId) => {
    try {
      const q = query(collection(db, "userVideos"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const urls = [];
      querySnapshot.forEach((doc) => {
        urls.push({ id: doc.id, ...doc.data() });
      });
      setUserUrls(urls);
    } catch (error) {
      console.error("Error fetching user URLs:", error);
    }
  };
  const fetchYouTubeTitle = async (videoId) => {
    try {
      // For development/testing, you can use this proxy approach
      const response = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
      );
      const data = await response.json();
      return data.title || "YouTube Video";
    } catch (error) {
      console.error("Error fetching YouTube title:", error);
      return "YouTube Video";
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
    setVideoUrl("");
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const saveVideoUrl = async (url) => {
    try {
      const videoId = getYouTubeId(url);
      let title = "Untitled Video";
      
      // Fetch title if it's a YouTube video
      if (videoId) {
        title = await fetchYouTubeTitle(videoId);
      }
  
      // Check if URL exists
      const existingUrlQuery = query(
        collection(db, "userVideos"),
        where("userId", "==", user.uid),
        where("videoUrl", "==", url)
      );
      
      const querySnapshot = await getDocs(existingUrlQuery);
      
      if (!querySnapshot.empty) {
        // Update existing
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "userVideos", existingDoc.id), {
          createdAt: new Date(),
          title: title
        });
      } else {
        // Add new
        await addDoc(collection(db, "userVideos"), {
          userId: user.uid,
          videoUrl: url,
          title: title,
          createdAt: new Date()
        });
      }
      
      await fetchUserUrls(user.uid);
      message.success("Video saved successfully");
    } catch (error) {
      console.error("Error saving URL:", error);
      message.error("Failed to save video");
    }
  };

  const handleAnalyze = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (videoUrl) {
      try {
        // Save/update the URL in Firestore
        await saveVideoUrl(videoUrl);
        console.log("Analyzing video from URL:", videoUrl);
        navigate("/analyze", { state: { videoUrl } });
      } catch (error) {
        console.error("Error saving URL:", error);
      }
    } else if (videoFile) {
      alert("File uploads not yet supported for this analysis flow.");
    } else {
      alert("Please provide a video URL or upload a file.");
    }
  };

  return (
    <header className="header-area relative z-10">
      {/* Navbar */}
      <div className="navbar-area">
        <div className="container relative">
          <div className="flex items-center justify-between py-6">
            <a className="navbar-brand" href="/">
              <img
                src={`${baseURL}/logo4.png`}
                alt="Logo"
                className="h-24 w-auto"
              />
            </a>
            <div className="hidden lg:flex items-center space-x-6 text-white">
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#facts">Why</a>
              <a href="#team">Team</a>
              <a href="#blog">Blog</a>

              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:scale-105 transition-transform"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2 rounded-full bg-green-500 text-white font-semibold shadow hover:scale-105 transition-transform"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div
        id="home"
        className="header-hero relative bg-cover bg-center py-32 lg:py-48"
        style={{ backgroundImage: `url(${baseURL}/banner-bg.svg)` }}
      >
        <div className="container relative z-10 text-center">
          <h3 className="text-4xl font-light text-white">EduSnap AI</h3>
          <h2 className="text-4xl font-bold text-white my-3">
            Enhance Learning with Smart Video Analysis
          </h2>
          <p className="text-white mb-8">
            Upload or paste a lecture video to get started.
          </p>

          <div className="mt-12 mx-auto max-w-3xl backdrop-blur-md bg-white/20 p-8 rounded-3xl shadow-2xl border border-white/30">
            {showLoginPrompt && (
              <div className="mb-4 p-3 bg-red-500/80 text-white rounded-lg animate-bounce">
                Please login first to use the analysis feature!
              </div>
            )}
            
            <h4 className="mb-4 text-2xl font-semibold text-white drop-shadow-md">
              Upload or Paste Lecture Video
            </h4>

          {/* Display user's saved URLs */}
          {user && userUrls.length > 0 && (
  <div className="mb-4">
    <label className="block mb-2 text-white font-medium">
      Your Saved Videos:
    </label>
    
    {/* Custom dropdown container */}
    <div className="relative">
      <div className="flex items-center justify-between w-full px-3 py-2 bg-indigo-900/80 border border-indigo-300/50 rounded-lg text-white cursor-pointer"
           onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {videoUrl ? (
          <div className="flex items-center">
            {getYouTubeId(videoUrl) && (
              <img 
                src={`https://img.youtube.com/vi/${getYouTubeId(videoUrl)}/default.jpg`}
                alt="Thumbnail"
                className="w-10 h-8 rounded mr-2"
              />
            )}
            <span className="truncate">
              {userUrls.find(u => u.videoUrl === videoUrl)?.title || "Selected Video"}
            </span>
          </div>
        ) : (
          <span>Select a saved video</span>
        )}
        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
      </div>
      
      {/* Dropdown options */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-indigo-900 border border-indigo-300/50 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {userUrls.map((item) => {
            const isYouTube = getYouTubeId(item.videoUrl);
            return (
              <div
                key={item.id}
                className={`flex items-center px-3 py-2 hover:bg-indigo-700 cursor-pointer ${videoUrl === item.videoUrl ? 'bg-indigo-800' : ''}`}
                onClick={() => {
                  setVideoUrl(item.videoUrl);
                  setIsDropdownOpen(false);
                }}
              >
                {isYouTube && (
                  <img 
                    src={`https://img.youtube.com/vi/${getYouTubeId(item.videoUrl)}/default.jpg`}
                    alt="Thumbnail"
                    className="w-12 h-9 rounded mr-3"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-white truncate font-medium">
                    {item.title || "Untitled Video"}
                  </p>
                  <p className="text-indigo-200 text-xs truncate">
                    {new URL(item.videoUrl).hostname.replace('www.', '')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}
            <input
              type="text"
              placeholder="Paste video URL (.mp4)"
              className="w-full mb-6 px-5 py-3 text-white bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 placeholder-white/80"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setVideoFile(null);
              }}
            />

            <div className="mb-6">
              <label
                className="block mb-2 text-white font-medium"
                htmlFor="video-upload"
              >
                Or upload a .mp4 file:
              </label>
              <input
                id="video-upload"
                type="file"
                accept="video/mp4"
                onChange={handleFileChange}
                className="w-full file:px-4 file:py-2 file:border-0 file:rounded-lg file:bg-gradient-to-r file:from-indigo-500 file:to-purple-500 file:text-white file:font-semibold text-white cursor-pointer"
              />
            </div>

            <button
              onClick={handleAnalyze}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
            >
              {user ? "Analyze Video" : "Login to Analyze"}
            </button>
          </div>
        </div>

        <div
          id="particles-1"
          className="particles absolute top-0 left-0 w-full h-full z-0"
        ></div>
      </div>
    </header>
  );
};

export default Header;



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../App.css';

// const Header = () => {
//   const navigate = useNavigate();
//   const [videoUrl, setVideoUrl] = useState('');

//   const handleAnalyzeClick = () => {
//     if (!videoUrl.trim()) {
//       alert('Please enter a video URL');
//       return;
//     }
    
//     // Basic URL validation
//     try {
//       new URL(videoUrl);
//     } catch (e) {
//       alert('Please enter a valid URL (e.g., https://example.com/video.mp4)');
//       return;
//     }

//     navigate('/analyze', { 
//       state: { 
//         videoUrl: videoUrl.trim() 
//       } 
//     });
//   };

//   return (
//     <header className="header-area min-h-screen flex items-center justify-center">
//       <div className="text-center w-full max-w-md px-4">
//         <h1 className="text-3xl font-bold text-white mb-6">Video Analyzer</h1>
        
//         <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
//           {/* URL Input Field */}
//           <input
//             type="text"
//             value={videoUrl}
//             onChange={(e) => setVideoUrl(e.target.value)}
//             placeholder="Paste video URL here..."
//             className="w-full px-4 py-3 mb-4 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
          
//           {/* Analyze Button */}
//           <button
//             onClick={handleAnalyzeClick}
//             disabled={!videoUrl.trim()}
//             className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${
//               videoUrl.trim() 
//                 ? 'bg-blue-600 hover:bg-blue-700'
//                 : 'bg-gray-500 cursor-not-allowed'
//             }`}
//           >
//             Analyze Video
//           </button>
          
//           <p className="text-sm text-white/70 mt-3">
//             Supports direct video links (MP4, etc.) and YouTube URLs
//           </p>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;