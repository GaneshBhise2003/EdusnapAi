import React, { useEffect } from 'react';
import aboutImage from '../assets/images/about1.svg';
import aboutShape from '../assets/images/about-shape-1.svg';
import 'animate.css';

const About = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

  return (
    <section id="about" className="relative pt-20 about-area">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          {/* Content */}
          <div className="w-full lg:w-1/2">
            <div className="mx-4 mt-12 about-content wow fadeInLeftBig" data-wow-duration="1s" data-wow-delay="0.5s">
              <div className="mb-4 section-title">
                <div className="line w-16 h-1 bg-blue-500 mb-4"></div>
                <h3 className="text-3xl font-semibold text-gray-900">
                  Discover Smarter <span className="text-blue-500">Learning with EduSnap AI</span>
                </h3>
              </div>
              <p className="mb-8 text-gray-700">
                EduSnap AI empowers students by analyzing educational videos in real time,
                extracting key visuals, notes, and voice data. It automatically detects and
                captures essential content before it's erased, making revision smarter and faster.
              </p>
              <a
                href="#"
                className="main-btn gradient-btn bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg transition duration-300 hover:opacity-90"
              >
                Start Learning Now
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="w-full lg:w-1/2">
            <div className="mx-4 mt-12 text-center about-image wow fadeInRightBig" data-wow-duration="1s" data-wow-delay="0.5s">
              <img src={aboutImage} alt="about" className="inline-block max-w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Shape */}
      <div className="about-shape-1 absolute bottom-0 left-0 w-full z-[-1]">
        <img src={aboutShape} alt="shape" className="w-full" />
      </div>
    </section>
  );
};

export default About;
