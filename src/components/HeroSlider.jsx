import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";
import "../styles/HeroSlider.css";
import { useNavigate } from "react-router-dom";

// Images are imported from src/assets/slider/ — copy the 4 files there
import collectionImg from "../assets/pic8.jpeg";
import tshirtImg from "../assets/pic10.jpeg";
import poloImg from "../assets/pic6.jpeg";
import joggersImg from "../assets/pic3.jpeg";

const slides = [
  {
    tag: "New Arrivals",
    titleLine1: "B-ZAK",
    titleLine2: "COLLECTION",
    desc: "Premium streetwear built for style, comfort, and everyday confidence.",
    image: collectionImg,
    button: "Shop Now",
  },
  {
    tag: "Everyday Essentials",
    titleLine1: "PREMIUM",
    titleLine2: "TEES",
    desc: "Soft, durable cotton tees with the iconic B-ZAK shield.",
    image: tshirtImg,
    button: "Shop Now",
  },
  {
    tag: "Timeless Style",
    titleLine1: "POLO",
    titleLine2: "SHIRTS",
    desc: "Premium fabric, perfect fit, and a look that defines you.",
    image: poloImg,
    button: "Shop Now",
  },
  {
    tag: "Train Hard",
    titleLine1: "TRACK",
    titleLine2: "PANTS",
    desc: "Lightweight, flexible joggers made for movement and comfort.",
    image: joggersImg,
    button: "Shop Now",
  },
];

const AUTOPLAY_MS = 3000;

const HeroSlider = () => {
  const [active, setActive] = useState(0);
   const navigate = useNavigate();
  const timerRef = useRef(null);

  const goTo = (index) => {
    setActive((index + slides.length) % slides.length);
  };

  const startAutoplay = () => {
    stopAutoplay();
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  const stopAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className="bzak-hero"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div className="bzak-hero-track">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`bzak-hero-slide ${i === active ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="bzak-hero-overlay" />
            <div className="container bzak-hero-content">
              <div className="bzak-hero-text">
                <p className="bzak-hero-tag">{slide.tag}</p>
                <h1 className="bzak-hero-title">
                  {slide.titleLine1}
                  <span className="bzak-hero-title-highlight">
                    {slide.titleLine2}
                  </span>
                </h1>
                <p className="bzak-hero-desc">{slide.desc}</p>
                <button className="bzak-hero-btn" onClick={() => navigate("/shop")}>
                  <FaArrowRight className="me-2" /> {slide.button}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        className="bzak-hero-arrow left"
        onClick={() => goTo(active - 1)}
        aria-label="Previous slide"
      >
        <FaChevronLeft />
      </button>
      <button
        className="bzak-hero-arrow right"
        onClick={() => goTo(active + 1)}
        aria-label="Next slide"
      >
        <FaChevronRight />
      </button>

      {/* Dots */}
      <div className="bzak-hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`bzak-hero-dot ${i === active ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;