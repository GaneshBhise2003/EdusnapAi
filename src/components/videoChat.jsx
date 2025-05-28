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
import { marked } from 'marked';
import QuickRevision from './QuickRevision'; // Import the new component




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
  const [isProcessing, setIsProcessing] = useState(false);const [notes, setNotes] = useState(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesStatus, setNotesStatus] = useState("");
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'notes', or 'frames'

  const [showPdfOptions, setShowPdfOptions] = useState(false);
const [pdfOptions, setPdfOptions] = useState({
  includeFrames: true,
  includeSummary: true,
  includeNotes: true,
  includeTranscript: false
});
const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);



  useEffect(() => {
    setHasRendered(true);
  }, []);

  // Add this new state variable
const [analysisComplete, setAnalysisComplete] = useState(false);
// Add these state variables
const [transcriptionReady, setTranscriptionReady] = useState(false);
const [showSummaryButton, setShowSummaryButton] = useState(false);
const [chatSessionId, setChatSessionId] = useState(null);
const [isStartingSession, setIsStartingSession] = useState(false);  

const [languages] = useState([
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', name: 'Assamese (অসমীয়া)' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)' },
  { code: 'ur', name: 'Urdu (اردو)' }
]);

const [selectedLanguage, setSelectedLanguage] = useState('en');
const [showLanguageSelector, setShowLanguageSelector] = useState(false);

const generateSmartNotes = async () => {
  if (!outputDir || !transcript) {
    alert("Please ensure the video has been processed and transcription is ready.");
    return;
  }

  setIsGeneratingNotes(true);
  setNotesStatus("Generating smart notes...");

  try {
    const response = await fetch(`http://localhost:5000/api/generate_notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transcript: transcript,
        summary: summary, // Optional: if you modify your Gemini prompt to use summary
        output_dir: outputDir,
        language: selectedLanguage // <<< ADD THIS LINE >>>
      })
    });

    if (!response.ok) {
      throw new Error("Failed to generate notes");
    }

    const data = await response.json();
    setNotes(data.notes);
    setNotesStatus("✅ Notes generated");

    setMessages(prev => [...prev, {
      sender: "bot",
      text: "I've generated structured notes from this video. You can find them below the transcript.",
      isSystem: true
    }]);

  } catch (error) {
    console.error("Notes generation error:", error);
    setNotesStatus(`❌ Failed to generate notes: ${error.message}`);
  } finally {
    setIsGeneratingNotes(false);
  }
};

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
    setLoadingStatus(`Generating transcript and summary in ${languages.find(l => l.code === selectedLanguage)?.name}...`);
    
    try {
      // First generate transcript
      const transcriptResponse = await fetch(`http://localhost:5000/api/generate_transcript/${outputDir}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage })
      });
      
      if (!transcriptResponse.ok) {
        throw new Error("Failed to generate transcript");
      }
      
      const transcriptData = await transcriptResponse.json();
      setTranscript(transcriptData.transcript);
      
      // Then generate summary
      const summaryResponse = await fetch(`http://localhost:5000/api/generate_summary/${outputDir}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage })
      });
      
      if (!summaryResponse.ok) {
        throw new Error("Failed to generate summary");
      }
      
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary);
      
      // Automatically generate notes
      await generateSmartNotes();
      
      setTranscriptionReady(true);
      setShowSummaryButton(false);
      setLoadingStatus(`✅ Analysis complete in ${languages.find(l => l.code === selectedLanguage)?.name}`);
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

// Initialize chat session when analysis is complete
useEffect(() => {
  if (analysisComplete && outputDir && !chatSessionId) {
    startChatSession();
  }
}, [analysisComplete, outputDir]);

const startChatSession = async () => {
  setIsStartingSession(true);
  try {
    const response = await fetch(`http://localhost:5000/api/chat/start_session/${outputDir}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      setChatSessionId(data.session_id);
      
      // Set the language for the session
      await fetch('http://localhost:5000/api/chat/set_language', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: data.session_id,
          language: selectedLanguage
        })
      });
      
      // Add welcome message with video context
      setMessages(prev => [...prev, {
        sender: "bot",
        text: `I'm ready to discuss this video with you in ${languages.find(l => l.code === selectedLanguage)?.name}.${summary ? ` Here's a quick overview:\n\n${summary.substring(0, 200)}...` : ''}\n\nAsk me anything about the content!`,
        isSystem: true
      }]);
    }
  } catch (err) {
    console.error("Failed to start chat session:", err);
  } finally {
    setIsStartingSession(false);
  }
};

// Update your handleSend function
const handleSend = async () => {
  if (!input.trim()) return;
  
  if (!chatSessionId) {
    setMessages(prev => [...prev, {
      sender: "bot",
      text: "Please wait while I finish initializing the video context...",
      isSystem: true
    }]);
    return;
  }

  const userMessage = { sender: "user", text: input };
  setMessages(prev => [...prev, userMessage]);
  setInput("");
  
  // Show typing indicator
  setMessages(prev => [...prev, { sender: "bot", text: "Typing...", isTyping: true }]);
  
  try {
    const response = await fetch('http://localhost:5000/api/chat/send_message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: chatSessionId,
        message: input
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to process your question");
    }
    
    // Replace typing indicator with actual response
    setMessages(prev => [
      ...prev.filter(msg => !msg.isTyping),
      { 
        sender: "bot", 
        text: data.response,
        reference: "Based on video analysis"
      }
    ]);
    
  } catch (error) {
    console.error("Chat error:", error);
    setMessages(prev => [
      ...prev.filter(msg => !msg.isTyping),
      { 
        sender: "bot", 
        text: error.message.includes("API request failed")
          ? "I'm having trouble connecting to the knowledge service. Please try again later."
          : error.message,
        isSystem: true
      }
    ]);
  }
};
// Add frame reference capability to chat
const handleFrameReference = async (frameNumber) => {
  if (!chatSessionId) return;
  
  const question = `Can you explain what's happening in frame ${frameNumber}?`;
  setInput(question);
  
  // Trigger send after a small delay to allow input to update
  setTimeout(() => {
    handleSend();
  }, 100);
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


  // const PdfGenerator = () => {
  //   const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  //   const [showPdfOptions, setShowPdfOptions] = useState(false);
  
  //   // Enhanced detectScript function with better language support
  //   const detectScript = (text) => {
  //     if (!text) return 'latin';
      
  //     // Check character by character for mixed content
  //     for (let i = 0; i < Math.min(text.length, 10); i++) {
  //       const char = text.charAt(i);
  //       const code = char.charCodeAt(0);
        
  //       // Devanagari (Hindi, Marathi, Sanskrit)
  //       if (code >= 0x0900 && code <= 0x097F) return 'devanagari';
  //       // Bengali
  //       if (code >= 0x0980 && code <= 0x09FF) return 'bengali';
  //       // Tamil
  //       if (code >= 0x0B80 && code <= 0x0BFF) return 'tamil';
  //       // Telugu
  //       if (code >= 0x0C00 && code <= 0x0C7F) return 'telugu';
  //       // Gujarati
  //       if (code >= 0x0A80 && code <= 0x0AFF) return 'gujarati';
  //       // Kannada
  //       if (code >= 0x0C80 && code <= 0x0CFF) return 'kannada';
  //       // Malayalam
  //       if (code >= 0x0D00 && code <= 0x0D7F) return 'malayalam';
  //       // Odia
  //       if (code >= 0x0B00 && code <= 0x0B7F) return 'oriya';
  //       // Arabic (Urdu)
  //       if (code >= 0x0600 && code <= 0x06FF) return 'arabic';
  //     }
      
  //     return 'latin';
  //   };
  
  //   const getFontForScript = (script) => {
  //     const fontMap = {
  //       devanagari: 'notosansdevanagari',
  //       bengali: 'notosansbengali',
  //       tamil: 'notosanstamil',
  //       telugu: 'notosanstelugu',
  //       gujarati: 'notosansgujarati',
  //       kannada: 'notosanskannada',
  //       malayalam: 'notosansmalayalam',
  //       oriya: 'notosansoriya',
  //       arabic: 'notosansarabic',
  //       latin: 'notosans'
  //     };
  //     return fontMap[script] || 'notosans';
  //   };
  
  //   const arrayBufferToBase64 = (buffer) => {
  //     let binary = '';
  //     const bytes = new Uint8Array(buffer);
  //     for (let i = 0; i < bytes.byteLength; i++) {
  //       binary += String.fromCharCode(bytes[i]);
  //     }
  //     return window.btoa(binary);
  //   };
  
  //   const loadFonts = async (doc) => {
  //     const fontUrls = {
  //       notosans: '/fonts/NotoSans-Regular.ttf',
  //       notosansdevanagari: '/fonts/NotoSansDevanagari-Regular.ttf',
  //       notosansbengali: '/fonts/NotoSansBengali-Regular.ttf',
  //       notosanstamil: '/fonts/NotoSansTamil-Regular.ttf',
  //       notosanstelugu: '/fonts/NotoSansTelugu-Regular.ttf',
  //       notosansgujarati: '/fonts/NotoSansGujarati-Regular.ttf',
  //       notosanskannada: '/fonts/NotoSansKannada-Regular.ttf',
  //       notosansmalayalam: '/fonts/NotoSansMalayalam-Regular.ttf',
  //       notosansoriya: '/fonts/NotoSansOriya-Regular.ttf',
  //       notosansarabic: '/fonts/NotoSansArabic-Regular.ttf'
  //     };
  
  //     for (const [fontName, url] of Object.entries(fontUrls)) {
  //       try {
  //         const response = await fetch(url);
  //         const fontData = await response.arrayBuffer();
  //         const fontBase64 = arrayBufferToBase64(fontData);
  //         doc.addFileToVFS(`${fontName}.ttf`, fontBase64);
  //         doc.addFont(`${fontName}.ttf`, fontName, 'normal');
  //       } catch (error) {
  //         console.warn(`Failed to load font ${fontName}:`, error);
  //       }
  //     }
  //   };
  
  //   const renderMixedContent = (doc, text, x, y, maxWidth, fontSize) => {
  //     let currentY = y;
  //     let currentX = x;
  //     let currentFont = 'notosans';
      
  //     // Split text into words while preserving spaces
  //     const words = text.split(/(\s+)/).filter(w => w.length > 0);
      
  //     for (const word of words) {
  //       const wordScript = detectScript(word);
  //       const wordFont = getFontForScript(wordScript);
        
  //       // Change font if needed
  //       if (wordFont !== currentFont) {
  //         currentFont = wordFont;
  //         doc.setFont(currentFont, 'normal');
  //       }
        
  //       const wordWidth = doc.getTextWidth(word);
        
  //       // Handle line breaks
  //       if (currentX + wordWidth > x + maxWidth) {
  //         currentX = x;
  //         currentY += fontSize * 1.2;
          
  //         // Handle page breaks
  //         if (currentY > 280) {
  //           doc.addPage();
  //           currentY = 20;
  //           currentX = x;
  //         }
  //       }
        
  //       // Special handling for RTL scripts
  //       if (wordScript !== 'latin') {
  //         const rtlWord = [...word].reverse().join('');
  //         doc.text(rtlWord, currentX, currentY, { charSpace: 0.15 });
  //       } else {
  //         doc.text(word, currentX, currentY);
  //       }
        
  //       currentX += wordWidth;
  //     }
      
  //     return currentY;
  //   };
  
  //   const generatePdf = async () => {
  //     setIsGeneratingPdf(true);
  //     setShowPdfOptions(false);
      
  //     try {
  //       const { jsPDF } = await import('jspdf');
  //       const doc = new jsPDF({
  //         orientation: 'portrait',
  //         unit: 'mm',
  //         format: 'a4',
  //         compress: true
  //       });
  
  //       await loadFonts(doc);
  
  //       doc.setProperties({
  //         title: 'Video Analysis Report',
  //         subject: 'Multilingual Video Content Analysis',
  //         author: 'Your App Name',
  //         keywords: 'video, analysis, multilingual',
  //         creator: 'Your App Name'
  //       });
  
  //       let yPosition = 20;
  //       const leftMargin = 15;
  //       const rightMargin = 15;
  //       const pageWidth = 210 - leftMargin - rightMargin;
  
  //       // Set default font
  //       doc.setFont('notosans', 'normal');
  
  //       // Add title
  //       doc.setFontSize(20);
  //       yPosition = renderMixedContent(doc, 'Video Analysis Report', 105, yPosition, pageWidth, 20);
  //       yPosition += 15;
  
  //       // Add date and language info
  //       doc.setFontSize(12);
  //       const currentLanguage = languages.find(lang => lang.code === selectedLanguage);
  //       const dateText = `Generated on: ${new Date().toLocaleDateString()} | Language: ${currentLanguage.name}`;
  //       yPosition = renderMixedContent(doc, dateText, 105, yPosition, pageWidth, 12);
  //       yPosition += 15;
  
  //       // Helper function to add content sections
  //       const addContentSection = (title, content, fontSize = 12) => {
  //         if (!content) return yPosition;
          
  //         // Render title
  //         doc.setFontSize(fontSize + 4);
  //         yPosition = renderMixedContent(doc, title, leftMargin, yPosition, pageWidth, fontSize + 4);
  //         yPosition += 10;
          
  //         // Render content
  //         doc.setFontSize(fontSize);
  //         const paragraphs = content.split('\n');
  //         for (const para of paragraphs) {
  //           yPosition = renderMixedContent(doc, para, leftMargin, yPosition, pageWidth, fontSize);
  //           yPosition += 5; // Paragraph spacing
  //         }
          
  //         return yPosition + 5; // Section spacing
  //       };
  
  //       // Add content sections
  //       if (pdfOptions.includeSummary && summary) {
  //         yPosition = addContentSection('Summary', summary);
  //       }
  
  //       if (pdfOptions.includeNotes && notes) {
  //         yPosition = addContentSection('Smart Notes', notes);
  //       }
  
  //       if (pdfOptions.includeTranscript && transcript) {
  //         yPosition = addContentSection('Transcript', transcript, 10);
  //       }
  
  //       // Handle images (unchanged from original)
  //       if (pdfOptions.includeFrames && frameUrls.length > 0) {
  //         doc.setFont('notosans', 'normal');
  //         doc.setFontSize(16);
  //         yPosition = renderMixedContent(doc, 'Key Frames', 105, yPosition, pageWidth, 16);
  //         yPosition += 20;
          
  //         const tempContainer = document.createElement('div');
  //         tempContainer.style.position = 'absolute';
  //         tempContainer.style.left = '-9999px';
  //         document.body.appendChild(tempContainer);
  
  //         try {
  //           const framesPerRow = 2;
  //           const imgWidth = 80;
  //           let xPosition = leftMargin;
            
  //           for (let i = 0; i < frameUrls.length; i++) {
  //             const img = document.createElement('img');
  //             img.src = frameUrls[i].url;
  //             img.style.maxWidth = '200px';
  //             img.style.height = 'auto';
  //             tempContainer.appendChild(img);
  
  //             await new Promise((resolve) => {
  //               img.onload = resolve;
  //               img.onerror = resolve;
  //             });
  
  //             const imgHeight = img.naturalHeight ? 
  //               (img.naturalHeight * imgWidth) / img.naturalWidth : 60;
  
  //             if (yPosition + imgHeight > 280) {
  //               doc.addPage();
  //               yPosition = 20;
  //               xPosition = leftMargin;
  //             } else if (i % framesPerRow === 0 && i !== 0) {
  //               yPosition += imgHeight + 10;
  //               xPosition = leftMargin;
  //             }
  
  //             doc.addImage(img, 'JPEG', xPosition, yPosition, imgWidth, imgHeight);
  //             xPosition += imgWidth + 10;
  //           }
  //         } finally {
  //           document.body.removeChild(tempContainer);
  //         }
  //       }
  
  //       doc.save(`video-analysis-report-${selectedLanguage}.pdf`);
        
  //     } catch (error) {
  //       console.error('Error generating PDF:', error);
  //       alert('Failed to generate PDF. Please try again.');
  //     } finally {
  //       setIsGeneratingPdf(false);
  //     }
  //   };
  // }
  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    setShowPdfOptions(false);
  
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
  
      // Load all required fonts
      await loadFonts(doc);
  
      // Set document metadata
      doc.setProperties({
        title: 'Video Analysis Report',
        subject: 'Multilingual Video Content Analysis',
        author: 'Your App Name',
        keywords: 'video, analysis, multilingual',
        creator: 'Your App Name'
      });
  
      let yPosition = 20;
      const leftMargin = 15;
      const rightMargin = 15;
      const pageWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin; // Calculate dynamic width
  
      // Helper function to detect script
      const detectScript = (text) => {
        if (!text) return 'latin';
  
        if (/[\u0900-\u097F]/.test(text)) return 'devanagari';   // Hindi, Marathi (LTR)
        if (/[\u0980-\u09FF]/.test(text)) return 'bengali';     // Bengali (LTR)
        if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';       // Tamil (LTR)
        if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';      // Telugu (LTR)
        if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati';    // Gujarati (LTR)
        if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';     // Kannada (LTR)
        if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam';   // Malayalam (LTR)
        if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return 'arabic'; // Arabic/Urdu (RTL)
  
        return 'latin'; // Default
      };
  
      // Function to render mixed content (remains the same)
      const renderMixedContent = (text, x, y, maxWidth, fontSize = 12, align = 'left') => {
        const segments = splitTextByScript(text);
        let currentY = y;
  
        for (const segment of segments) {
          const font = getFontForScript(segment.script);
          doc.setFont(font, 'normal');
          doc.setFontSize(fontSize);
  
          let currentX = x;
          if (align === 'center') {
            currentX = doc.internal.pageSize.getWidth() / 2;
          }
  
          const lines = doc.splitTextToSize(segment.text, maxWidth);
  
          for (const line of lines) {
            if (currentY > 280) {
              doc.addPage();
              currentY = 20;
              doc.setFont(font, 'normal');
              doc.setFontSize(fontSize);
            }
  
            let finalX = x;
            if (align === 'center') {
              const lineWidth = doc.getStringUnitWidth(line) * fontSize / doc.internal.scaleFactor;
              finalX = (doc.internal.pageSize.getWidth() - lineWidth) / 2;
            }
  
            doc.text(line, finalX, currentY);
  
            currentY += fontSize * 0.35;
          }
        }
  
        return currentY;
      };
  
  
      // ---
      // Key Change: Refined splitTextByScript
      // ---
      const splitTextByScript = (text) => {
        if (!text) return [];
  
        const segments = [];
        let currentScript = detectScript(text[0]);
        let currentSegment = { script: currentScript, text: '' };
  
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const charScript = detectScript(char);
  
          // Define characters that don't force a script break (e.g., spaces, punctuation, numbers)
          const nonBreakingChars = [' ', '.', ',', '!', '?', ':', ';', '-', '(', ')', '[', ']', '{', '}', '\'', '"'];
          const isNumber = !isNaN(parseInt(char));
  
          if (charScript !== currentScript) {
            // If the character is a space, punctuation, or a number,
            // and the current segment is not empty, append it to the current segment
            // rather than forcing a new segment. This allows numbers and punctuation
            // to stick with the surrounding language.
            if (nonBreakingChars.includes(char) || isNumber) {
              currentSegment.text += char;
            } else {
              // Only create a new segment if it's a genuine script change
              // (e.g., from Devanagari letter to a Latin letter, or vice versa,
              // and it's not just punctuation or a number).
              if (currentSegment.text) {
                segments.push(currentSegment);
              }
              currentScript = charScript;
              currentSegment = { script: currentScript, text: char };
            }
          } else {
            currentSegment.text += char;
          }
        }
  
        if (currentSegment.text) {
          segments.push(currentSegment);
        }
        return segments;
      };
  
  
      // Get appropriate font for script (remains the same)
      const getFontForScript = (script) => {
        const fontMap = {
          devanagari: 'notosansdevanagari',
          bengali: 'notosansbengali',
          tamil: 'notosanstamil',
          telugu: 'notosanstelugu',
          gujarati: 'notosansgujarati',
          kannada: 'notosanskannada',
          malayalam: 'notosansmalayalam',
          arabic: 'notosansarabic',
          latin: 'notosans'
        };
        return fontMap[script] || 'notosans';
      };
  
      // Add title (centered)
      const title = selectedLanguage === 'hi' ? 'वीडियो विश्लेषण रिपोर्ट' :
        selectedLanguage === 'mr' ? 'व्हिडिओ विश्लेषण अहवाल' :
        'Video Analysis Report';
      yPosition = renderMixedContent(title, 105, yPosition, pageWidth, 20, 'center');
      yPosition += 15;
  
      // Add date and language info
      const dateText = selectedLanguage === 'hi' ? `जनरेट किया गया: ${new Date().toLocaleDateString()}` :
        selectedLanguage === 'mr' ? `तयार केले: ${new Date().toLocaleDateString()}` :
        `Generated on: ${new Date().toLocaleDateString()}`;
      yPosition = renderMixedContent(dateText, 105, yPosition, pageWidth, 12, 'center');
      yPosition += 15;
  
      // Add summary if selected
      if (pdfOptions.includeSummary && summary) {
        const summaryTitle = selectedLanguage === 'hi' ? 'सारांश' :
          selectedLanguage === 'mr' ? 'सारांश' :
          'Summary';
        yPosition = renderMixedContent(summaryTitle, leftMargin, yPosition, pageWidth, 16);
        yPosition += 10;
        yPosition = renderMixedContent(summary, leftMargin, yPosition, pageWidth, 12);
        yPosition += 20;
      }
  
      // Add notes if selected
      if (pdfOptions.includeNotes && notes) {
        const notesTitle = selectedLanguage === 'hi' ? 'स्मार्ट नोट्स' :
          selectedLanguage === 'mr' ? 'स्मार्ट नोट्स' :
          'Smart Notes';
        yPosition = renderMixedContent(notesTitle, leftMargin, yPosition, pageWidth, 16);
        yPosition += 10;
        yPosition = renderMixedContent(notes, leftMargin, yPosition, pageWidth, 12);
        yPosition += 20;
      }
  
      // Add transcript if selected (smaller font)
      if (pdfOptions.includeTranscript && transcript) {
        const transcriptTitle = selectedLanguage === 'hi' ? 'ट्रांसक्रिप्ट' :
          selectedLanguage === 'mr' ? 'लिप्यंतरण' :
          'Transcript';
        yPosition = renderMixedContent(transcriptTitle, leftMargin, yPosition, pageWidth, 16);
        yPosition += 10;
        yPosition = renderMixedContent(transcript, leftMargin, yPosition, pageWidth, 10);
        yPosition += 20;
      }
  
      // Add frames if selected
      if (pdfOptions.includeFrames && frameUrls.length > 0) {
        const framesTitle = selectedLanguage === 'hi' ? 'मुख्य फ्रेम' :
          selectedLanguage === 'mr' ? 'मुख्य चित्रे' :
          'Key Frames';
        yPosition = renderMixedContent(framesTitle, 105, yPosition, pageWidth, 16, 'center');
        yPosition += 20;
  
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
  
        try {
          const imgWidth = 80;
          let xPosition = leftMargin;
  
          for (let i = 0; i < frameUrls.length; i++) {
            const img = document.createElement('img');
            img.src = frameUrls[i].url;
            img.style.maxWidth = '200px';
            img.style.height = 'auto';
            tempContainer.appendChild(img);
  
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
  
            const imgHeight = img.naturalHeight ?
              (img.naturalHeight * imgWidth) / img.naturalWidth : 60;
  
            if (yPosition + imgHeight > 280) {
              doc.addPage();
              yPosition = 20;
              xPosition = leftMargin;
            } else if (i > 0 && (xPosition + imgWidth + 10) > (doc.internal.pageSize.getWidth() - rightMargin)) {
              yPosition += imgHeight + 10;
              xPosition = leftMargin;
            }
  
            doc.addImage(
              img,
              'JPEG',
              xPosition,
              yPosition,
              imgWidth,
              imgHeight
            );
  
            xPosition += imgWidth + 10;
          }
        } finally {
          document.body.removeChild(tempContainer);
        }
      }
  
      const filename = selectedLanguage === 'hi' ? 'वीडियो-विश्लेषण-रिपोर्ट.pdf' :
        selectedLanguage === 'mr' ? 'व्हिडिओ-विश्लेषण-अहवाल.pdf' :
        'video-analysis-report.pdf';
      doc.save(filename);
  
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = selectedLanguage === 'hi' ? 'PDF जनरेट करने में विफल। कृपया पुनः प्रयास करें।' :
        selectedLanguage === 'mr' ? 'PDF तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.' :
        'Failed to generate PDF. Please try again.';
      alert(errorMsg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  // Font loading function (remains the same)
  async function loadFonts(doc) {
    const fontUrls = {
      notosans: '/fonts/NotoSans-Regular.ttf',
      notosansdevanagari: '/fonts/NotoSansDevanagari-Regular.ttf',
      notosansbengali: '/fonts/NotoSansBengali-Regular.ttf',
      notosanstamil: '/fonts/NotoSansTamil-Regular.ttf',
      notosanstelugu: '/fonts/NotoSansTelugu-Regular.ttf',
      notosansgujarati: '/fonts/NotoSansGujarati-Regular.ttf',
      notosanskannada: '/fonts/NotoSansKannada-Regular.ttf',
      notosansmalayalam: '/fonts/NotoSansMalayalam-Regular.ttf',
      notosansarabic: '/fonts/NotoSansArabic-Regular.ttf'
    };
  
    for (const [fontName, url] of Object.entries(fontUrls)) {
      try {
        const response = await fetch(url);
        const fontData = await response.arrayBuffer();
        const fontBase64 = arrayBufferToBase64(fontData);
        doc.addFileToVFS(`${fontName}.ttf`, fontBase64);
        doc.addFont(`${fontName}.ttf`, fontName, 'normal');
      } catch (error) {
        console.warn(`Failed to load font ${fontName}:`, error);
      }
    }
  }
  
  // Helper function (remains the same)
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  useEffect(() => {
    // You can use this to verify supported languages if needed
    fetch('http://localhost:5000/api/get_supported_languages')
      .then(res => res.json())
      .then(data => console.log("Supported languages:", data))
      .catch(err => console.error("Failed to fetch languages:", err));
  }, []);

  const handleLanguageChange = async (languageCode) => {
    if (!outputDir) return;
    
    try {
      setIsProcessing(true);
      setLoadingStatus(`Generating content in ${languages.find(l => l.code === languageCode)?.name}...`);
      
      // Create abort controller for cleanup
      const controller = new AbortController();
      
      // 1. Generate transcript
      const transcriptResponse = await fetch(`http://localhost:5000/api/generate_transcript/${outputDir}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: languageCode }),
        signal: controller.signal
      });
      
      if (!transcriptResponse.ok) {
        throw new Error("Transcript generation failed");
      }
      
      const transcriptData = await transcriptResponse.json();
      
      // 2. Generate summary
      const summaryResponse = await fetch(`http://localhost:5000/api/generate_summary/${outputDir}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: languageCode }),
        signal: controller.signal
      });
      
      if (!summaryResponse.ok) {
        throw new Error("Summary generation failed");
      }
      
      const summaryData = await summaryResponse.json();
      
      // 3. Update UI state only after both succeed
      setSelectedLanguage(languageCode);
      setTranscript(transcriptData.transcript);
      setSummary(summaryData.summary);
      setTranscriptionReady(true);
      
      // 4. Update chat session language if exists
      if (chatSessionId) {
        await fetch('http://localhost:5000/api/chat/set_language', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            session_id: chatSessionId,
            language: languageCode
          }),
          signal: controller.signal
        });
      }
      
      setLoadingStatus(`✅ Content generated in ${languages.find(l => l.code === languageCode)?.name}`);
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Language change error:", err);
        setLoadingStatus(`❌ Failed to generate content: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
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
       {/* In your return statement, modify the chat messages rendering: */}
<div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
  {messages.map((msg, idx) => (
    <div key={idx} className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
        msg.sender === "user" 
          ? "bg-purple-600 text-white rounded-br-none" 
          : msg.isSystem
            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
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
  {isStartingSession && (
    <div className="flex justify-start">
      <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 rounded-bl-none">
        <div className="flex space-x-1 items-center">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          <span className="ml-2">Initializing video context...</span>
        </div>
      </div>
    </div>
  )}
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
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    {/* Left side - Status indicators */}
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-purple-600 mr-1">Status:</span>
      
      {/* Main processing status */}
      <span className={`text-sm ${loadingStatus.includes("✅") ? "text-green-600" : loadingStatus.includes("❌") ? "text-red-600" : "text-gray-700"}`}>
        {loadingStatus}
      </span>
      
      {/* Available resources indicators */}
      {transcriptionReady && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Transcript available */}
          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Transcript
          </span>
          
          {/* Summary available */}
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Summary
          </span>
          
          {/* Notes available (conditional) */}
          {notes && (
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Notes
            </span>
          )}
        </div>
      )}
    </div>

    {/* Right side - Action buttons and output info */}
    <div className="flex items-center gap-3">
    {/* // Add this component near your other action buttons */}
<div className="relative">
  <button 
    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
    className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
    {languages.find(l => l.code === selectedLanguage)?.name}
    <svg className={`w-4 h-4 transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {showLanguageSelector && (
    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => {
            setSelectedLanguage(lang.code);
            setShowLanguageSelector(false);
            handleLanguageChange(lang.code);
          }}
          className={`block w-full text-left px-4 py-2 text-sm ${
            selectedLanguage === lang.code
              ? 'bg-purple-100 text-purple-800'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  )}
</div>
      {/* Generate Summary button (conditional) */}
      {showSummaryButton && (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <button 
      onClick={handleGenerateSummary}
      disabled={isProcessing}
      className={`px-3 py-1 rounded-md text-sm flex items-center ${
        isProcessing 
          ? 'bg-purple-400 cursor-not-allowed' 
          : 'bg-purple-600 hover:bg-purple-700'
      } text-white transition-colors`}
    >
      {isProcessing ? (
        <>
          <svg className="w-3 h-3 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Generate Summary
        </>
      )}
    </button>

    {/* Add the language selector here */}
    <div className="relative">
      {/* ... language selector code from above ... */}
    </div>
  </div>
)}

      {/* Output directory info */}
      {outputDir && (
        <div className="text-xs text-gray-500 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Output:</span>
          <span className="font-mono ml-1">{outputDir}</span>
        </div>
      )}
    </div>
  </div>

  {/* Notes generation status (appears below when generating) */}
  {isGeneratingNotes && (
    <div className="mt-2 text-xs text-purple-600 flex items-center">
      <svg className="w-3 h-3 animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {notesStatus}
    </div>
  )}
</div>

{/* Tabbed Interface */}
<div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'summary' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('summary')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          {selectedLanguage === 'hi' ? 'सारांश' : selectedLanguage === 'mr' ? 'सारांश' : 'Summary'}
        </button>

        <button
          className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'notes' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('notes')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {selectedLanguage === 'hi' ? 'स्मार्ट नोट्स' : selectedLanguage === 'mr' ? 'स्मार्ट नोट्स' : 'Smart Notes'}
        </button>

        <button
          className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'frames' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('frames')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {selectedLanguage === 'hi' ? 'मुख्य फ़्रेम' : selectedLanguage === 'mr' ? 'मुख्य चित्रे' : 'Key Frames'} ({frameUrls.length})
        </button>

        {/* --- New Tab Header --- */}
        <button
          className={`px-4 py-3 font-medium text-sm flex items-center ${activeTab === 'revision' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('revision')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
          </svg>
          {selectedLanguage === 'hi' ? 'त्वरित पुनरीक्षण' : selectedLanguage === 'mr' ? 'जलद उजळणी' : 'Quick Revision'}
        </button>
        {/* --- End New Tab Header --- */}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Summary Tab */}
        {activeTab === 'summary' && transcriptionReady && summary && (
          <div className="whitespace-pre-wrap text-gray-700 animate-fadeIn">
            {summary}
          </div>
        )}

        {/* Smart Notes Tab */}
        {activeTab === 'notes' && (
          <div className="animate-fadeIn">
            {notes ? (
              <>
                <div className="flex justify-end mb-4">
                  <a
                    href={`http://localhost:5000/api/results/${outputDir}/smart_notes.md`}
                    download
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {selectedLanguage === 'hi' ? 'डाउनलोड करें' : selectedLanguage === 'mr' ? 'डाउनलोड करा' : 'Download'}
                  </a>
                </div>
                <div
                  className="prose max-w-none max-h-[calc(100vh-300px)] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: marked.parse(notes) }}
                />
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isGeneratingNotes ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {notesStatus}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <p className="mb-4">{selectedLanguage === 'hi' ? 'अभी तक कोई नोट्स जनरेट नहीं हुए हैं।' : selectedLanguage === 'mr' ? 'अद्याप कोणतेही नोट्स तयार केले नाहीत.' : 'No notes generated yet.'}</p>
                    <button
                      onClick={generateSmartNotes}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      disabled={isGeneratingNotes}
                    >
                      <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {selectedLanguage === 'hi' ? 'स्मार्ट नोट्स जनरेट करें' : selectedLanguage === 'mr' ? 'स्मार्ट नोट्स तयार करा' : 'Generate Smart Notes'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Key Frames Tab */}
        {activeTab === 'frames' && (
          <div className="animate-fadeIn">
            {frameUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                      <span className="text-white text-sm font-medium">{selectedLanguage === 'hi' ? `फ़्रेम ${frame.number}` : selectedLanguage === 'mr' ? `फ्रेम ${frame.number}` : `Frame ${frame.number}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>{selectedLanguage === 'hi' ? 'प्रदर्शित करने के लिए कोई फ़्रेम उपलब्ध नहीं हैं' : selectedLanguage === 'mr' ? 'प्रदर्शित करण्यासाठी कोणतेही फ्रेम्स उपलब्ध नाहीत' : 'No frames available to display'}</p>
              </div>
            )}
          </div>
        )}

        {/* --- New Quick Revision Tab Content --- */}
        {activeTab === 'revision' && (
          <QuickRevision
            summary={summary}
            transcript={transcript}
            selectedLanguage={selectedLanguage}
          />
        )}
        {/* --- End New Quick Revision Tab Content --- */}
      </div>
    </div>
  

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


  {/* PDF Floating Button */}
  {analysisComplete && (
      <button
        onClick={() => setShowPdfOptions(true)}
        disabled={isGeneratingPdf}
        className="fixed bottom-6 left-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg z-50 flex items-center justify-center"
      >
        {isGeneratingPdf ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        )}
      </button>
    )}

    {/* PDF Options Modal */}
    {showPdfOptions && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Select PDF Content</h3>
          
          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={pdfOptions.includeFrames}
                onChange={() => setPdfOptions({...pdfOptions, includeFrames: !pdfOptions.includeFrames})}
                className="form-checkbox h-5 w-5 text-purple-600 rounded"
              />
              <span>Include Key Frames ({frameUrls.length})</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={pdfOptions.includeSummary}
                onChange={() => setPdfOptions({...pdfOptions, includeSummary: !pdfOptions.includeSummary})}
                className="form-checkbox h-5 w-5 text-purple-600 rounded"
              />
              <span>Include Summary</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={pdfOptions.includeNotes}
                onChange={() => setPdfOptions({...pdfOptions, includeNotes: !pdfOptions.includeNotes})}
                className="form-checkbox h-5 w-5 text-purple-600 rounded"
              />
              <span>Include Smart Notes</span>
            </label>
            
            {/* <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={pdfOptions.includeTranscript}
                onChange={() => setPdfOptions({...pdfOptions, includeTranscript: !pdfOptions.includeTranscript})}
                className="form-checkbox h-5 w-5 text-purple-600 rounded"
              />
              <span>Include Transcript</span>
            </label> */}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPdfOptions(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={generatePdf}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    )}
    
    </div>
  );
};

export default VideoChatbotPage;