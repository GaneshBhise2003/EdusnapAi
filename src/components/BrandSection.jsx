import React from "react";
import { motion } from "framer-motion";

const brands = [
  { src: "assets/images/brand-1.png", delay: 0.2 },
  { src: "assets/images/brand-2.png", delay: 0.2 },
  { src: "assets/images/brand-3.png", delay: 0.3 },
  { src: "assets/images/brand-4.png", delay: 0.4 },
  { src: "assets/images/brand-5.png", delay: 0.5 },
];

const BrandSection = () => {
  return (
    <div className="pt-24 bg-white brand-area">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center lg:justify-between items-center gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={index}
              className="single-logo hover:opacity-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: brand.delay }}
            >
              <img src={brand.src} alt={`brand-${index + 1}`} className="h-16 object-contain" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSection;
