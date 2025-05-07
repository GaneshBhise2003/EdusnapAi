

// import React from 'react';
// import Header from './components/header';
// import BrandSection from './components/BrandSection';
// import ServicesSection from './components/service';
// import About from './components/about'
// import AboutFeatures from './components/aboutFeatures'
// import TeamSection from './components/team';
// import Footer from './components/footer';
// import './assets/css/animate.css';
// import './assets/css/slick.css';
// import './assets/css/magnific-popup.css';
// import './assets/css/LineIcons.2.0.css';
// import './assets/css/tailwind.css'; // or your custom compiled Tailwind
// import "slick-carousel/slick/slick.css"; 
// import "slick-carousel/slick/slick-theme.css";
// import VideoChatbotPage from './components/videoChat'



// function App() {
//   return (
//     <div>
//       <Header />
//       <BrandSection />
//       <ServicesSection />
//       <About />
//       <AboutFeatures />
//       {/* <TeamSection /> */}
//       <Footer />
//       {/* Other sections/components go here */}
//       {/* <VideoChatbotPage /> */}
//     </div>
//   );
// }

// export default App;




// working ----------------------------(1)
//src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/header';
import BrandSection from './components/BrandSection';
import ServicesSection from './components/service';
import About from './components/about';
import AboutFeatures from './components/aboutFeatures';
import Footer from './components/footer';
import VideoChatbotPage from './components/videoChat';
import './assets/css/animate.css';
import './assets/css/slick.css';
import './assets/css/magnific-popup.css';
import './assets/css/LineIcons.2.0.css';
import './assets/css/tailwind.css'; // or your custom compiled Tailwind
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import Signup from './components/signup';
import Login from './components/Login';
import Profile from './components/Profile';

function Home() {
  return (
    <>
      <Header />
      <BrandSection />
      <ServicesSection />
      <About />
      <AboutFeatures />
      <Footer />
     {/* <Login/> */}
     
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<VideoChatbotPage />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={< Signup/>}/>
        <Route path='/profile' element ={<Profile/>}/>
      </Routes>
    </Router>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Header from './components/header';
// import VideoAnalysisPage from './components/VideoAnalysisPage';
// import VideoResults from './components/VideoResults';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Header />} />
//         <Route path="/analyze" element={<VideoAnalysisPage />} />
//         <Route path="/results" element={<VideoResults />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;