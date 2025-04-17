import React from "react";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
function Carousel({ images, activeIndex, handlePrev, handleNext }) {
  return (
    <div className="position-relative overflow-hidden">
      <div className="ratio ratio-16x9">
        <img src={`${baseUrl}${images[activeIndex]}`} className="d-block w-100 h-100 object-fit-cover" alt="Product" style={{ minHeight: "300px" }} />
      </div>
      <div className="carousel-controls">
        <button className="btn btn-sm btn-dark opacity-75 rounded-pill px-3" onClick={handlePrev}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <button className="btn btn-sm btn-dark opacity-75 rounded-pill px-3" onClick={handleNext}>
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

export default Carousel;
