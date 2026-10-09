import { useEffect, useState } from "react";
import "./PublicHero.css";

const heroImages = [
  "/images/hero/hero1.jpg",
  "/images/hero/hero2.jpg",
  "/images/hero/hero3.jpg",
  "/images/hero/hero4.jpg",
];

const PublicHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(
        (previousSlide) => (previousSlide + 1) % heroImages.length,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="public-hero">
      {/* Background Slideshow */}
      <div className="hero-slideshow">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`hero-slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url("${image}")` }}
          />
        ))}
      </div>

      {/* Dark Overlay */}
      <div className="hero-overlay"></div>

      {/* Hero Content */}
      <div className="hero-content">
        <span className="hero-eyebrow">
          BUILDING INFRASTRUCTURE. BUILDING THE FUTURE.
        </span>

        <h1>
          Engineering Excellence.
          <br />
          <span>Building Tomorrow.</span>
        </h1>

        <p>
          Delivering reliable infrastructure solutions through engineering
          expertise, quality construction, and a commitment to excellence.
        </p>

        <div className="hero-buttons">
          <a href="#projects" className="hero-btn hero-btn-primary">
            Explore Our Projects
          </a>

          <a href="#contact" className="hero-btn hero-btn-secondary">
            Contact Us
          </a>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="hero-dots">
        {heroImages.map((image, index) => (
          <button
            key={image}
            type="button"
            className={`hero-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={index === currentSlide}
          />
        ))}
      </div>

      <div className="hero-slide-counter">
        <span>{String(currentSlide + 1).padStart(2, "0")}</span>
        <span className="hero-counter-divider"></span>
        <span>{String(heroImages.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
};

export default PublicHero;
