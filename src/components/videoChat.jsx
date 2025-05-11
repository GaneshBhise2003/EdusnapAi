// //working
// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import ReactPlayer from "react-player";
// import "animate.css";

// const VideoChatbotPage = () => {
//   const location = useLocation();
//   const videoUrl = location.state?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4";
//   const [transcript, setTranscript] = useState(null);
//   const [summary, setSummary] = useState(null);

//   // State variables
//   const [hasRendered, setHasRendered] = useState(false);
//   const [loadingStatus, setLoadingStatus] = useState("Initializing...");
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "Hi! I'm EduBot. Ask me anything about the video." },
//   ]);
//   const [input, setInput] = useState("");
//   const [frameUrls, setFrameUrls] = useState([]);
//   const [outputDir, setOutputDir] = useState("");
//   const [selectedFrame, setSelectedFrame] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);

//   useEffect(() => {
//     setHasRendered(true);
//   }, []);

//   // Add this new state variable
// const [analysisComplete, setAnalysisComplete] = useState(false);

// // Modify your main useEffect
// useEffect(() => {
//   const isDefaultUrl = videoUrl === "https://www.w3schools.com/html/mov_bbb.mp4" && !location.state?.videoUrl;
  
//   if (!hasRendered || isDefaultUrl || isProcessing || analysisComplete) return;

//   setIsProcessing(true);
//   setLoadingStatus("Analyzing video...");
  
//   const controller = new AbortController();
//   const signal = controller.signal;

//   const timer = setTimeout(() => {
//     fetch("http://localhost:5000/api/analyze", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ url: videoUrl }),
//       signal
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error("Server responded with error");
//         return res.json();
//       })
//       .then((data) => {
//         console.log("API Response:", data);
        
//         if (data.frame_files) {
//           setOutputDir(data.output_dir);
          
//           // Create array with URLs and extracted frame numbers
//           const frameList = data.frame_files.map((filename) => {
//             // Extract number from filename (e.g., "frame_7.png" → 7)
//             const frameNumMatch = filename.match(/frame_(\d+)\.png/);
//             const frameNum = frameNumMatch ? parseInt(frameNumMatch[1]) : 0;
            
//             return {
//               url: `/frames/${data.output_dir}/${filename}`, // Changed from /api/frames to /frames
//               number: frameNum
//             };
//           });

//           // Sort frames by their numbers (optional)
//           frameList.sort((a, b) => a.number - b.number);
          
//           setFrameUrls(frameList);
//           console.log('Frames loaded:', frameList);
//         }
        
//         if (data.transcript) {
//           setTranscript(data.transcript);
//         } else if (data.output_dir) {
//           fetchTranscript(data.output_dir);
//         }
        
//         if (data.summary) {
//           setSummary(data.summary);
//         } else if (data.output_dir) {
//           fetchSummary(data.output_dir);
//         }
        
//         setLoadingStatus("✅ Analysis complete");
//         setAnalysisComplete(true);
//       })
//       .catch((err) => {
//         if (err.name !== 'AbortError') {
//           console.error("Analysis Error:", err);
//           setLoadingStatus(`❌ Failed: ${err.message}`);
//         }
//       })
//       .finally(() => {
//         setIsProcessing(false);
//       });
//   }, 500);

//   return () => {
//     clearTimeout(timer);
//     controller.abort();
//     setIsProcessing(false);
//   };
// }, [hasRendered, videoUrl, location.state, analysisComplete]);

//   const fetchTranscript = async (dir) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/transcript/${dir}`);
//       if (response.ok) {
//         const text = await response.text();
//         setTranscript(text);
//       }
//     } catch (err) {
//       console.error("Failed to fetch transcript:", err);
//     }
//   };

//   const fetchSummary = async (dir) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/summary/${dir}`);
//       if (response.ok) {
//         const text = await response.text();
//         setSummary(text);
//       }
//     } catch (err) {
//       console.error("Failed to fetch summary:", err);
//     }
//   };

//   // Frame preview handler
//   const handleFrameClick = (url, frameNumber) => {
//     setSelectedFrame({ url, number: frameNumber });
//     setShowModal(true);
//   };

//   // Close modal
//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedFrame(null);
//   };

//   // Send user message
//   // Add this function to your component
// // In your queryGemini function, remove the OUTPUT_FOLDER reference
// const queryGemini = async (query) => {
//   try {
//     const response = await fetch('http://localhost:5000/api/query', {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       body: JSON.stringify({ query }),
//       credentials: 'same-origin'
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.response || "I didn't get a proper response. Please try again.";
//   } catch (error) {
//     console.error('Query error:', error.message);
//     return `I encountered an error: ${error.message}`;
//   }
// };

// // Update your handleSend function
// // Update your handleSend function
// const handleSend = async () => {
//   if (!input.trim()) return;
  
//   const userMessage = { sender: "user", text: input };
//   setMessages((prev) => [...prev, userMessage]);
//   setInput("");
  
//   // Show typing indicator
//   setMessages(prev => [...prev, { sender: "bot", text: "Typing...", isTyping: true }]);
  
//   try {
//     const response = await queryGemini(input);
//     setMessages(prev => [
//       ...prev.filter(msg => !msg.isTyping),
//       { 
//         sender: "bot", 
//         text: response,
//         reference: "Based on video analysis"
//       }
//     ]);
//   } catch (error) {
//     console.error("Chat error:", error);
//     setMessages(prev => [
//       ...prev.filter(msg => !msg.isTyping),
//       { 
//         sender: "bot", 
//         text: "Sorry, I'm experiencing technical difficulties. Please try again later.",
//       }
//     ]);
//   }
// };
  
//   const extractFrameNumber = (input) => {
//     const match = input.match(/\d+/);
//     return match ? parseInt(match[0]) : null;
//   };
  
//   // Helper function to find relevant parts of transcript
//   const findRelevantTranscriptPart = (query) => {
//     if (!transcript) return "No transcript available";
    
//     const lowerQuery = query.toLowerCase();
//     const sentences = transcript.split('\n');
    
//     for (const sentence of sentences) {
//       if (sentence.toLowerCase().includes(lowerQuery)) {
//         return sentence;
//       }
//     }
    
//     return "I couldn't find an exact match in the transcript, but here's a relevant part: " + 
//       sentences[Math.floor(Math.random() * sentences.length)];
//   };

//   // Enter key support
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") handleSend();
//   };

//   return (
// <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6 animate__animated animate__fadeIn">
//   {/* Top Section: Video + Chatbot */}
//   <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-6">
//     {/* Video Player */}
//     <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
//       <div className="relative h-0 pb-[56.25%]">
//         <ReactPlayer 
//           url={videoUrl}
//           controls
//           width="100%"
//           height="100%"
//           className="absolute top-0 left-0"
//         />
//       </div>
//     </div>

//     {/* Chatbot */}
//     <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
//       <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
//         <div className="flex items-center">
//           <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//             </svg>
//           </div>
//           <div>
//             <h2 className="font-bold text-lg">EduBot Assistant</h2>
//             <p className="text-xs opacity-80">Ask me about the video</p>
//           </div>
//         </div>
//       </div>
      
//       {/* Chat messages container with fixed height and scrolling */}
//       <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
//             <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
//               msg.sender === "user" 
//                 ? "bg-purple-600 text-white rounded-br-none" 
//                 : "bg-gray-100 text-gray-800 rounded-bl-none"
//             }`}>
//               {msg.isTyping ? (
//                 <div className="flex space-x-1 items-center">
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                   <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
//                 </div>
//               ) : (
//                 <>
//                   {msg.text}
//                   {msg.reference && (
//                     <div className="mt-1 text-xs opacity-80">
//                       {msg.reference}
//                     </div>
//                   )}
//                   {msg.frame && (
//                     <div className="mt-2">
//                       <img 
//                         src={msg.frame} 
//                         alt={`Frame from video`}
//                         className="rounded-lg cursor-pointer max-h-40 object-contain"
//                         onClick={() => handleFrameClick(msg.frame, idx)}
//                       />
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input area - fixed at bottom */}
//       <div className="border-t border-gray-200 p-3">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="Type your question..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//           <button
//             onClick={handleSend}
//             disabled={isProcessing}
//             className={`p-2 rounded-full transition ${
//               isProcessing 
//                 ? 'bg-purple-400 cursor-not-allowed' 
//                 : 'bg-purple-600 hover:bg-purple-700'
//             } text-white`}
//           >
//             {isProcessing ? (
//               <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : (
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//               </svg>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>

//       {/* Status Bar */}
//       <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
//         <div className="flex items-center justify-between">
//           <div>
//             <span className="font-semibold text-purple-600 mr-2">Status:</span>
//             <span className={loadingStatus.includes("✅") ? "text-green-600" : loadingStatus.includes("❌") ? "text-red-600" : "text-gray-700"}>
//               {loadingStatus}
//             </span>
//             {transcript && (
//               <span className="ml-2 text-green-600">
//                 <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 Transcript available
//               </span>
//             )}
//             {summary && (
//               <span className="ml-2 text-blue-600">
//                 <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
//                 </svg>
//                 Summary available
//               </span>
//             )}
//           </div>
//           {outputDir && (
//             <span className="text-sm text-gray-500">
//               <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
//               </svg>
//               {outputDir}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Summary Section */}
//       {summary && (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
//           <div className="p-4 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-purple-700 flex items-center">
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
//               </svg>
//               Video Summary
//             </h3>
//           </div>
//           <div className="p-4">
//             <div className="whitespace-pre-wrap text-gray-700">
//               {summary}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Transcript Section */}
//       {transcript && (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
//           <div className="p-4 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-purple-700 flex items-center">
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               Video Transcript
//             </h3>
//           </div>
//           <div className="p-4 max-h-96 overflow-y-auto">
//             <div className="whitespace-pre-wrap text-gray-700">
//               {transcript}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Frames Section */}
//       {frameUrls.length > 0 ? (
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="p-4 border-b border-gray-200">
//           <h3 className="text-lg font-bold text-purple-700 flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//             Key Frames ({frameUrls.length})
//           </h3>
//         </div>
        
//         <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           {frameUrls.map((frame) => (
//             <div 
//               key={frame.number}
//               className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
//               onClick={() => handleFrameClick(frame.url, frame.number)}
//             >
//               <img
//                 src={frame.url}
//                 alt={`Frame ${frame.number}`}
//                 className="w-full h-32 object-cover"
//                 onError={(e) => {
//                   e.target.src = '/placeholder-image.png';
//                   console.error('Failed to load frame:', frame.url);
//                 }}
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
//                 <span className="text-white text-sm font-medium">Frame {frame.number}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     ) : (
//       loadingStatus === "✅ Analysis complete" && (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//           <p className="text-gray-500">No frames available to display</p>
//         </div>
//       )
//     )}

//       {/* Frame Preview Modal */}
//       {showModal && selectedFrame && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h3 className="text-lg font-bold">Frame {selectedFrame.index + 1}</h3>
//               <button 
//                 onClick={closeModal}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//             <div className="p-4 overflow-auto max-h-[80vh] flex justify-center">
//               <img 
//                 src={selectedFrame.url} 
//                 alt={`Preview Frame ${selectedFrame.index + 1}`}
//                 className="max-w-full max-h-[70vh] object-contain"
//               />
//             </div>
//             <div className="p-4 border-t text-right">
//               <button
//                 onClick={closeModal}
//                 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoChatbotPage;




//split backend into parts
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import "animate.css";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import FloatingNotes from './FloatingNotes';

const VideoChatbotPage = () => {
  const [user] = useAuthState(auth);

  const location = useLocation();
  const videoUrl = location.state?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4";
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);

  // State variables
  const [hasRendered, setHasRendered] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm EduBot. Ask me anything about the video." },
  ]);
  const [input, setInput] = useState("");
  const [frameUrls, setFrameUrls] = useState([]);
  const [outputDir, setOutputDir] = useState("");
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setHasRendered(true);
  }, []);

  // Add this new state variable
const [analysisComplete, setAnalysisComplete] = useState(false);
// Add these state variables
const [transcriptionReady, setTranscriptionReady] = useState(false);
const [showSummaryButton, setShowSummaryButton] = useState(false);


// Modify your main useEffect
useEffect(() => {
  const isDefaultUrl = videoUrl === "https://www.w3schools.com/html/mov_bbb.mp4" && !location.state?.videoUrl;
  
  if (!hasRendered || isDefaultUrl || isProcessing || analysisComplete) return;

  setIsProcessing(true);
  setLoadingStatus("Analyzing video...");
  
  const controller = new AbortController();
  const signal = controller.signal;

  const timer = setTimeout(() => {
    fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: videoUrl }),
      signal
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server responded with error");
        return res.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        
        if (data.frame_files) {
          setOutputDir(data.output_dir);
          
          const frameList = data.frame_files.map((filename) => {
            const frameNumMatch = filename.match(/frame_(\d+)\.png/);
            const frameNum = frameNumMatch ? parseInt(frameNumMatch[1]) : 0;
            
            return {
              url: `/frames/${data.output_dir}/${filename}`,
              number: frameNum
            };
          });

          frameList.sort((a, b) => a.number - b.number);
          setFrameUrls(frameList);
          console.log('Frames loaded:', frameList);
          
          // Show summary button after frames are loaded
          setShowSummaryButton(true);
        }
        
        setLoadingStatus("✅ Frames extracted");
        setAnalysisComplete(true);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error("Analysis Error:", err);
          setLoadingStatus(`❌ Failed: ${err.message}`);
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, 500);

  return () => {
    clearTimeout(timer);
    controller.abort();
    setIsProcessing(false);
  };
}, [hasRendered, videoUrl, location.state, analysisComplete]);

  const fetchTranscript = async (dir) => {
    try {
      const response = await fetch(`http://localhost:5000/api/transcript/${dir}`);
      if (response.ok) {
        const text = await response.text();
        setTranscript(text);
      }
    } catch (err) {
      console.error("Failed to fetch transcript:", err);
    }
  };

  const fetchSummary = async (dir) => {
    try {
      const response = await fetch(`http://localhost:5000/api/summary/${dir}`);
      if (response.ok) {
        const text = await response.text();
        setSummary(text);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  // Frame preview handler
  const handleFrameClick = (url, frameNumber) => {
    setSelectedFrame({ url, number: frameNumber });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedFrame(null);
  };

  const handleGenerateSummary = async () => {
    if (!outputDir) return;
    
    setIsProcessing(true);
    setLoadingStatus("Generating transcript and summary...");
    
    try {
      const response = await fetch(`http://localhost:5000/api/process_transcription/${outputDir}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // Add empty body if your backend expects JSON
        body: JSON.stringify({})  
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate summary");
      }
      
      const data = await response.json();
      
      if (data.transcript) {
        setTranscript(data.transcript);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      setTranscriptionReady(true);
      setShowSummaryButton(false);
      setLoadingStatus("✅ Analysis complete");
    } catch (err) {
      console.error("Summary generation error:", err);
      setLoadingStatus(`❌ Failed to generate summary: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Send user message
  // Add this function to your component
// In your queryGemini function, remove the OUTPUT_FOLDER reference
const queryGemini = async (query) => {
  try {
    const response = await fetch('http://localhost:5000/api/query', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query }),
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "I didn't get a proper response. Please try again.";
  } catch (error) {
    console.error('Query error:', error.message);
    return `I encountered an error: ${error.message}`;
  }
};

// Update your handleSend function
// Update your handleSend function
const handleSend = async () => {
  if (!input.trim()) return;
  
  const userMessage = { sender: "user", text: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  
  // Show typing indicator
  setMessages(prev => [...prev, { sender: "bot", text: "Typing...", isTyping: true }]);
  
  try {
    const response = await queryGemini(input);
    setMessages(prev => [
      ...prev.filter(msg => !msg.isTyping),
      { 
        sender: "bot", 
        text: response,
        reference: "Based on video analysis"
      }
    ]);
  } catch (error) {
    console.error("Chat error:", error);
    setMessages(prev => [
      ...prev.filter(msg => !msg.isTyping),
      { 
        sender: "bot", 
        text: "Sorry, I'm experiencing technical difficulties. Please try again later.",
      }
    ]);
  }
};

const formatMessageText = (text) => {
  if (!text) return null;
  
  // Split by lines and process each line
  return text.split('\n').map((line, i) => {
    // Skip empty lines
    if (!line.trim()) return null;
    
    // Check for bullet points
    if (line.trim().startsWith('* ')) {
      return (
        <div key={i} className="flex items-start mt-1">
          <span className="mr-2">•</span>
          <span>{formatInlineElements(line.replace('* ', ''))}</span>
        </div>
      );
    }
    
    // Regular paragraph
    return <div key={i} className="mt-1">{formatInlineElements(line)}</div>;
  });
};

const formatInlineElements = (text) => {
  const parts = [];
  let remaining = text;
  
  // Process bold text (**text**)
  while (remaining.includes('**')) {
    const before = remaining.substring(0, remaining.indexOf('**'));
    remaining = remaining.substring(remaining.indexOf('**') + 2);
    const boldText = remaining.substring(0, remaining.indexOf('**'));
    remaining = remaining.substring(remaining.indexOf('**') + 2);
    
    if (before) parts.push(before);
    parts.push(<strong key={parts.length}>{boldText}</strong>);
  }
  
  if (remaining) parts.push(remaining);
  
  return parts.length > 0 ? parts : text;
};
  
  const extractFrameNumber = (input) => {
    const match = input.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  };
  
  // Helper function to find relevant parts of transcript
  const findRelevantTranscriptPart = (query) => {
    if (!transcript) return "No transcript available";
    
    const lowerQuery = query.toLowerCase();
    const sentences = transcript.split('\n');
    
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(lowerQuery)) {
        return sentence;
      }
    }
    
    return "I couldn't find an exact match in the transcript, but here's a relevant part: " + 
      sentences[Math.floor(Math.random() * sentences.length)];
  };

  // Enter key support
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  

  return (
<div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6 animate__animated animate__fadeIn">
  {/* Top Section: Video + Chatbot */}
  <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-6">
    {/* Video Player */}
    <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-0 pb-[56.25%]">
        <ReactPlayer 
          url={videoUrl}
          controls
          width="100%"
          height="100%"
          className="absolute top-0 left-0"
        />
      </div>
    </div>

    {/* Chatbot */}
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-lg">EduBot Assistant</h2>
            <p className="text-xs opacity-80">Ask me about the video</p>
          </div>
        </div>
      </div>
      
      {/* Chat messages container with fixed height and scrolling */}
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
  msg.sender === "user" 
    ? "bg-purple-600 text-white rounded-br-none" 
    : "bg-gray-100 text-gray-800 rounded-bl-none"
}`}>
  {msg.isTyping ? (
    <div className="flex space-x-1 items-center">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  ) : (
    <>
      <div className="whitespace-pre-wrap">
        {formatMessageText(msg.text)}
      </div>
      {msg.reference && (
        <div className="mt-1 text-xs opacity-80">
          {msg.reference}
        </div>
      )}
      {msg.frame && (
        <div className="mt-2">
          <img 
            src={msg.frame} 
            alt={`Frame from video`}
            className="rounded-lg cursor-pointer max-h-40 object-contain"
            onClick={() => handleFrameClick(msg.frame, idx)}
          />
        </div>
      )}
    </>
  )}
</div>
          </div>
        ))}
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className={`p-2 rounded-full transition ${
              isProcessing 
                ? 'bg-purple-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white`}
          >
            {isProcessing ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
  <div className="flex items-center justify-between">
    <div>
      <span className="font-semibold text-purple-600 mr-2">Status:</span>
      <span className={loadingStatus.includes("✅") ? "text-green-600" : loadingStatus.includes("❌") ? "text-red-600" : "text-gray-700"}>
        {loadingStatus}
      </span>
      {transcriptionReady && (
        <>
          <span className="ml-2 text-green-600">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Transcript available
          </span>
          <span className="ml-2 text-blue-600">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Summary available
          </span>
        </>
      )}
    </div>
    {showSummaryButton && (
      <button 
        onClick={handleGenerateSummary}
        disabled={isProcessing}
        className={`px-3 py-1 rounded-md text-sm ${
          isProcessing 
            ? 'bg-purple-400 cursor-not-allowed' 
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white`}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg className="w-3 h-3 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Generate Summary"
        )}
      </button>
    )}
    {outputDir && (
      <span className="text-sm text-gray-500">
        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
        {outputDir}
      </span>
    )}
  </div>
</div>

      {/* Summary Section */}
      {transcriptionReady && summary && (
         <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-purple-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Video Summary
            </h3>
          </div>
          <div className="p-4">
            <div className="whitespace-pre-wrap text-gray-700">
              {summary}
            </div>
          </div>
        </div>
      )}

      {/* Transcript Section */}
      {transcriptionReady && transcript && (
       <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-purple-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Video Transcript
            </h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="whitespace-pre-wrap text-gray-700">
              {transcript}
            </div>
          </div>
        </div>
      )}

      {/* Frames Section */}
      {frameUrls.length > 0 ? (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-purple-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Key Frames ({frameUrls.length})
          </h3>
        </div>
        
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {frameUrls.map((frame) => (
            <div 
              key={frame.number}
              className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleFrameClick(frame.url, frame.number)}
            >
              <img
                src={frame.url}
                alt={`Frame ${frame.number}`}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                  console.error('Failed to load frame:', frame.url);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-sm font-medium">Frame {frame.number}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      loadingStatus === "✅ Analysis complete" && (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No frames available to display</p>
        </div>
      )
    )}

      {/* Frame Preview Modal */}
      {showModal && selectedFrame && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Frame {selectedFrame.index + 1}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh] flex justify-center">
              <img 
                src={selectedFrame.url} 
                alt={`Preview Frame ${selectedFrame.index + 1}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 border-t text-right">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

            <FloatingNotes videoUrl={videoUrl} />

    </div>
  );
};

export default VideoChatbotPage;