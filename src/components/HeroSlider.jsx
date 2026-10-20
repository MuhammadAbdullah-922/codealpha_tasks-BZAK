import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";
import "../styles/HeroSlider.css";
import { useNavigate } from "react-router-dom";

import collectionImg from "../assets/pic8.png";
import poloImg from "../assets/pic6.png";
import polo2Img from "../assets/pic9.png";
import trouserImg from "../assets/blue-trouser.png";
import whiteTrouserImg from "../assets/white-trouser.png";
import shortsImg from "../assets/shorts.png";

const slides = [
  {
    tag: "Timeless Style",
    titleLine1: "POLO",
    titleLine2: "SHIRTS",
    desc: "Premium fabric, perfect fit, and a look that defines you.",
    image: collectionImg,
    button: "Shop Now",
    position: "center 20%",
  },
  {
    tag: "Timeless Style",
    titleLine1: "POLO",
    titleLine2: "SHIRTS",
    desc: "Soft, breathable cotton with the iconic B-ZAK shield.",
    image: poloImg,
    button: "Shop Now",
    position: "center 20%",
  },
  {
    tag: "Timeless Style",
    titleLine1: "POLO",
    titleLine2: "SHIRTS",
    desc: "Classic fit, breathable fabric, effortless everyday style.",
    image: polo2Img,
    button: "Shop Now",
    position: "center 20%",
  },
  {
    tag: "New Drop",
    titleLine1: "TROUSERS",
    titleLine2: "CLASSIC",
    desc: "Tailored comfort with a modern streetwear edge.",
    image: trouserImg,
    button: "Shop Now",
    position: "center 15%",
  },
  {
    tag: "Clean & Sharp",
    titleLine1: "WHITE",
    titleLine2: "TROUSERS",
    desc: "Crisp, minimal, and made for effortless everyday wear.",
    image: whiteTrouserImg,
    button: "Shop Now",
    position: "center 15%",
  },
  {
    tag: "Summer Ready",
    titleLine1: "CASUAL",
    titleLine2: "SHORTS",
    desc: "Lightweight, breathable, and built for warm-weather comfort.",
    image: shortsImg,
    button: "Shop Now",
    position: "center 20%",
  },
];

const AUTOPLAY_MS = 4000;

const HeroSlider = () => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const goTo = (index) => {
    const next = (index + slides.length) % slides.length;
    setActive(next);
  };

  const startAutoplay = () => {
    stopAutoplay();
    timerRef.current = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  const stopAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

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
          >
            <img
              src={slide.image}
              alt={slide.titleLine1 + " " + slide.titleLine2}
              className="bzak-hero-img"
              style={{
                objectPosition: slide.position || "center",
                opacity: 1,
              }}
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="bzak-hero-overlay" />
            <div className="container bzak-hero-content">
              <div
                className="bzak-hero-text"
                key={active === i ? `active-${i}` : i}
              >
                <p className="bzak-hero-tag">{slide.tag}</p>
                <h1 className="bzak-hero-title">
                  {slide.titleLine1}
                  <span className="bzak-hero-title-highlight">
                    {slide.titleLine2}
                  </span>
                </h1>
                <p className="bzak-hero-desc">{slide.desc}</p>
                <button
                  className="bzak-hero-btn"
                  onClick={() => navigate("/shop")}
                >
                  <FaArrowRight className="me-2" /> {slide.button}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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