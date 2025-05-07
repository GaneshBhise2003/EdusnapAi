// import React, { useEffect } from 'react';
// import aboutImage2 from '../assets/images/about2.svg';
// import aboutShape2 from '../assets/images/about-shape-2.svg';
// import 'animate.css';

// const AboutFeatures = () => {
//   useEffect(() => {
//     if (window.WOW) {
//       new window.WOW().init();
//     }
//   }, []);

//   return (
//     <section className="relative pt-20 about-area">
//       {/* Shape Background */}
//       <div className="about-shape-2 absolute top-0 left-0 w-full z-[-1]">
//         <img src={aboutShape2} alt="shape" className="w-full" />
//       </div>

//       <div className="container mx-auto px-4">
//         <div className="flex flex-wrap items-center">
//           {/* Image on the left for large screens */}
//           <div className="w-full lg:w-1/2 lg:order-first">
//             <div
//               className="mx-4 mt-12 text-center about-image wow fadeInRightBig"
//               data-wow-duration="1s"
//               data-wow-delay="0.5s"
//             >
//               <img src={aboutImage2} alt="about" className="inline-block max-w-full" />
//             </div>
//           </div>

//           {/* Text Content */}
//           <div className="w-full lg:w-1/2 lg:order-last">
//             <div
//               className="mx-4 mt-12 about-content wow fadeInLeftBig"
//               data-wow-duration="1s"
//               data-wow-delay="0.5s"
//             >
//               <div className="mb-4 section-title">
//                 <div className="line w-16 h-1 bg-purple-500 mb-4"></div>
//                 <h3 className="text-3xl font-semibold text-gray-900">
//                   Smart Features <span className="text-purple-500">Built for Better Learning</span>
//                 </h3>
//               </div>
//               <p className="mb-8 text-gray-700">
//                 EduSnap AI combines real-time visual extraction, audio-to-text conversion, and intelligent note
//                 summarization to help students keep up with fast-paced lectures. Whether it's a YouTube video or a
//                 classroom board, EduSnap captures it all — before it's gone.
//               </p>
//               <a
//                 href="#"
//                 className="main-btn gradient-btn bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg transition duration-300 hover:opacity-90"
//               >
//                 Explore Features
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AboutFeatures;


import React, { useEffect } from 'react';
import aboutImage2 from '../assets/images/about2.svg';
import aboutShape2 from '../assets/images/about-shape-2.svg';
import 'animate.css';

const AboutFeatures = () => {
  useEffect(() => {
    // Dynamically import wow.js to avoid SSR issues
    import('wow.js').then(({ default: WOW }) => {
      new WOW({
        boxClass: 'wow',
        animateClass: 'animated', // Must match animate.css class
        offset: 0,
        mobile: true,
        live: true,
        scrollContainer: null
      }).init();
    });

    return () => {
      // Cleanup if needed
      if (window.WOW) {
        window.WOW.prototype.stop();
      }
    };
  }, []);

  return (
    <section className="relative pt-20 about-area">
      {/* Shape Background */}
      <div className="about-shape-2 absolute top-0 left-0 w-full z-[-1]">
        <img src={aboutShape2} alt="shape" className="w-full" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          {/* Image on the left for large screens */}
          <div className="w-full lg:w-1/2 lg:order-first">
            <div
              className="mx-4 mt-12 text-center about-image wow fadeInRightBig"
              data-wow-duration="1s"
              data-wow-delay="0.5s"
            >
              <img src={aboutImage2} alt="about" className="inline-block max-w-full" />
            </div>
          </div>

          {/* Text Content */}
          <div className="w-full lg:w-1/2 lg:order-last">
            <div
              className="mx-4 mt-12 about-content wow fadeInLeftBig"
              data-wow-duration="1s"
              data-wow-delay="0.5s"
            >
              <div className="mb-4 section-title">
                <div className="line w-16 h-1 bg-purple-500 mb-4"></div>
                <h3 className="text-3xl font-semibold text-gray-900">
                  Smart Features <span className="text-purple-500">Built for Better Learning</span>
                </h3>
              </div>
              <p className="mb-8 text-gray-700">
                EduSnap AI combines real-time visual extraction, audio-to-text conversion, and intelligent note
                summarization to help students keep up with fast-paced lectures. Whether it's a YouTube video or a
                classroom board, EduSnap captures it all — before it's gone.
              </p>
              <a
                href="#"
                className="main-btn gradient-btn bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg transition duration-300 hover:opacity-90"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFeatures;