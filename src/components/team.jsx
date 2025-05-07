import React from "react";
import team1 from "../assets/images/team-1.png";
import team2 from "../assets/images/team-2.png";
import team3 from "../assets/images/team-3.png";
import team4 from "../assets/images/team-3.png"; // Add your 4th member image

const teamMembers = [
  {
    name: "John Doe",
    role: "AI Engineer",
    image: team1,
    delay: "0.2s",
  },
  {
    name: "Jane Smith",
    role: "Frontend Developer",
    image: team2,
    delay: "0.5s",
  },
  {
    name: "Robert Brown",
    role: "Backend Developer",
    image: team3,
    delay: "0.8s",
  },
  {
    name: "Emily Johnson",
    role: "Product Designer",
    image: team4,
    delay: "1.1s",
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="team-area pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full lg:w-2/3 text-center">
            <div className="pb-8 section-title">
              <div className="m-auto w-16 h-1 bg-blue-500 mb-4"></div>
              <h3 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-500">Meet Our</span> Creative Team Members
              </h3>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center">
          {teamMembers.map((member, index) => (
            <div key={index} className="w-full sm:w-2/3 lg:w-1/4 px-4 mt-8 text-center animate__animated animate__fadeIn" style={{ animationDelay: member.delay }}>
              <div className="relative rounded-lg overflow-hidden shadow-lg team-image">
                <img src={member.image} alt={member.name} className="w-full" />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition duration-300 flex items-center justify-center">
                  <ul className="flex space-x-4">
                    <li><a href="#" className="text-white text-xl"><i className="lni lni-facebook-filled"></i></a></li>
                    <li><a href="#" className="text-white text-xl"><i className="lni lni-twitter-filled"></i></a></li>
                    <li><a href="#" className="text-white text-xl"><i className="lni lni-instagram-filled"></i></a></li>
                    <li><a href="#" className="text-white text-xl"><i className="lni lni-linkedin-original"></i></a></li>
                  </ul>
                </div>
              </div>
              <div className="p-6">
                <h5 className="mb-1 text-xl font-bold text-gray-900">{member.name}</h5>
                <p className="text-gray-600">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
