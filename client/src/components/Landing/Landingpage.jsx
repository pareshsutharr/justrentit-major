import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination } from "swiper/modules";

const images = [
  "/images/p6.jpg",
  "/images/p6.jpg",
  "/images/p6.jpg",
  "/images/p6.jpg",
  "/images/p6.jpg",
];

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center  bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated Title */}
      <motion.h1
        className="text-6xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
      >
        Circular 3D Carousel
      </motion.h1>

      {/* Enhanced Swiper Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="w-full max-w-2xl px-8"
      >
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 5,
            stretch: -50,
            depth: 400,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          modules={[EffectCoverflow, Pagination]}
          className="circular-swiper"
        >
          {images.map((img, index) => (
            <SwiperSlide
              key={index}
              className="flex items-center justify-center w-50 h-36"
            >
              <motion.div
                className="relative rounded-full overflow-hidden border-4 border-white/20 hover:border-cyan-300 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover rounded-full transform transition-transform duration-500 hover:rotate-12"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 rounded-full" />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {/* Style additions for Swiper */}
      <style jsx global>{`
        .circular-swiper {
          --swiper-pagination-color: #22d3ee;
          --swiper-pagination-bullet-size: 12px;
          --swiper-pagination-bullet-horizontal-gap: 8px;
        }
        .circular-swiper .swiper-pagination-bullet {
          transition: all 0.3s ease;
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
        }
        .circular-swiper .swiper-pagination-bullet-active {
          transform: scale(1.4);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;