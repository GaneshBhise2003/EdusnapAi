import React from "react";
import logo from "../assets/images/logo4.png"; // Make sure this path is correct

const Footer = () => {
  return (
    <footer id="footer" className="relative z-10 footer-area pt-32">
      <div
        className="footer-bg absolute top-0 left-0 w-full h-full bg-cover bg-no-repeat"
        style={{ backgroundImage: "url(/assets/images/footer-bg.svg)" }}
      ></div>

      <div className="container mx-auto relative z-10">
        {/* Subscribe Section */}
        <div className="px-6 pt-10 pb-20 mb-12 bg-white rounded-lg shadow-xl md:px-12">
          <div className="flex flex-wrap justify-between items-center">
            <div className="w-full lg:w-1/2">
              <div className="lg:mt-12">
                <h2 className="text-2xl font-bold sm:text-4xl">
                  Subscribe Our Newsletter
                  <span className="block font-normal">get regular updates</span>
                </h2>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="mt-12">
                <form className="relative">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="w-full py-4 pl-6 pr-40 duration-300 border-2 rounded focus:border-blue-500 focus:outline-none"
                  />
                  <button className="absolute top-0 right-0 h-full px-6 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-r">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Widgets */}
        <div className="pb-32">
          <div className="flex flex-wrap">
            {/* About Section */}
            <div className="w-full lg:w-1/3 mb-12">
              <div>
                <a href="/" className="inline-block mb-8">
                  <img src={logo} alt="EduSnap AI Logo" className="w-40" />
                </a>
                <p className="pb-10 pr-10 leading-snug text-white">
                  EduSnap AI helps students capture and analyze lecture content through advanced AI, combining board capture, audio-to-text, and chatbot assistance.
                </p>
                <ul className="flex space-x-4">
                  <li><a href="#"><i className="lni lni-facebook-filled text-white text-xl"></i></a></li>
                  <li><a href="#"><i className="lni lni-twitter-filled text-white text-xl"></i></a></li>
                  <li><a href="#"><i className="lni lni-instagram-filled text-white text-xl"></i></a></li>
                  <li><a href="#"><i className="lni lni-linkedin-original text-white text-xl"></i></a></li>
                </ul>
              </div>
            </div>

            {/* Quick Links */}
            <div className="w-full sm:w-1/2 lg:w-1/6 mb-12">
              <div>
                <h4 className="mb-6 text-2xl font-bold text-white">Quick Links</h4>
                <ul className="space-y-2 text-white">
                  <li><a href="#">Road Map</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Refund Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Pricing</a></li>
                </ul>
              </div>
            </div>

            {/* Resources */}
            <div className="w-full sm:w-1/2 lg:w-1/6 mb-12">
              <div>
                <h4 className="mb-6 text-2xl font-bold text-white">Resources</h4>
                <ul className="space-y-2 text-white">
                  <li><a href="#">Home</a></li>
                  <li><a href="#">Features</a></li>
                  <li><a href="#">Analysis</a></li>
                  <li><a href="#">Chatbot</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="w-full lg:w-1/3 mb-12">
              <div>
                <h4 className="mb-6 text-2xl font-bold text-white">Contact Us</h4>
                <ul className="text-white space-y-2">
                  <li>+91 98765 43210</li>
                  <li>edusnap.ai@gmail.com</li>
                  <li>www.edusnapai.com</li>
                  <li>123 Learning St, New Delhi, India</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
      
      </div>
    </footer>
  );
};

export default Footer;
