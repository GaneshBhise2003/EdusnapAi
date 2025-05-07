import React, { useEffect } from 'react';
import '../assets/css/animate.css';

const Services = () => {
  useEffect(() => {
    // Load LineIcons CSS
    const link = document.createElement('link');
    link.href = 'https://cdn.lineicons.com/4.0/lineicons.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Initialize animations
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

  const features = [
    {
      title: 'Visual Snapshots',
      icon: 'lni lni-camera',
      shape: 'services-shape-1.svg',
      delay: '0.2s',
      description: 'Capture smartboard snapshots before they are erased.',
    },
    {
      title: 'AI-Powered Transcripts',
      icon: 'lni lni-microphone',
      shape: 'services-shape-2.svg',
      delay: '0.5s',
      description: 'Convert lectures to clean, structured text using NLP.',
    },
    {
      title: 'Interactive Learning Bot',
      icon: 'lni lni-cog', // Changed from lni-robot to lni-cog (verified working icon)
      shape: 'services-shape-3.svg',
      delay: '0.8s',
      description: 'Ask questions to EduSnap\'s AI chatbot for instant answers.',
    },
  ];

  return (
    <section id="features" className="services-area pt-120 bg-white">
      <div className="container">
        <div className="flex justify-center">
          <div className="w-full lg:w-2/3">
            <div className="pb-10 text-center">
              <div className="mx-auto w-16 h-1 bg-indigo-500 mb-4"></div>
              <h3 className="text-3xl font-semibold">
                Enhance Learning with AI,
                <span className="block text-indigo-600">Built for Students Like You!</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center">
          {features.map((item, index) => (
            <div className="w-full sm:w-2/3 lg:w-1/3 p-4" key={index}>
              <div 
                className="text-center wow fadeIn" 
                data-wow-duration="1s" 
                data-wow-delay={item.delay}
              >
                <div className="relative inline-block mb-6 w-20 h-20">
                  <img 
                    src="/assets/images/services-shape.svg" 
                    alt="Decoration" 
                    className="absolute inset-0 w-full h-full opacity-10"
                  />
                  <img 
                    src={`/assets/images/${item.shape}`} 
                    alt="Feature icon background"
                    className="absolute inset-0 w-full h-full"
                  />
                  {/* <i className={`${item.icon} text-4xl text-indigo-600 relative z-10`}></i> */}
                </div>
                <div className="mt-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <a href="#learn-more" className="text-indigo-600 hover:underline">
                    Learn More <i className="lni lni-chevron-right ml-1"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;