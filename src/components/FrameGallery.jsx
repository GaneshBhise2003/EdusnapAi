import React, { useEffect, useState } from "react";

const FrameGallery = ({ videoId, frameCount }) => {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    if (!videoId || frameCount === 0) return;

    const urls = [];
    for (let i = 1; i <= frameCount; i++) {
      const padded = i.toString().padStart(5, "0");
      const url = `http://localhost:5000/api/results/${videoId}/${padded}.png`;
      urls.push(url);
    }
    setFrames(urls);
  }, [videoId, frameCount]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Extracted Frames</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {frames.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`frame-${idx}`}
            className="rounded shadow hover:scale-105 transition-transform"
          />
        ))}
      </div>
    </div>
  );
};

export default FrameGallery;
