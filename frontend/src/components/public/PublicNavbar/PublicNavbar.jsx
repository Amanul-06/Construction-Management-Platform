import { useState, useEffect } from "react";
import { Menu, X, HardHat, ArrowUpRight, ChevronDown } from "lucide-react";

import "./PublicNavbar.css";

function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navigationLinks = [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Projects", href: "#projects" },
    { label: "Our Strengths", href: "#strengths" },
    { label: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = navigationLinks
        .map((link) => document.querySelector(link.href))
        .filter(Boolean);

      let currentSection = "home";

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 150) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNavigation = (href) => {
    setMenuOpen(false);

    const targetId = href.replace("#", "");

    setActiveSection(targetId);
  };

  return (
    <>
      <header className={`public-navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="public-navbar-container">
          {/* Brand */}

          <a
            href="#home"
            className="navbar-brand"
            aria-label="Builder 360 Home"
            onClick={() => handleNavigation("#home")}
          >
            <div className="navbar-brand-icon">
              <HardHat size={29} strokeWidth={1.8} />
            </div>

            <div className="navbar-brand-text">
              <span className="navbar-brand-name">
                BUILDER<span>360</span>
              </span>

              <span className="navbar-brand-tagline">BUILDING THE FUTURE</span>
            </div>
          </a>

          {/* Desktop Navigation */}

          <nav className="navbar-navigation" aria-label="Main navigation">
            {navigationLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`navbar-link ${
                  activeSection === link.href.slice(1)
                    ? "navbar-link-active"
                    : ""
                }`}
                onClick={() => handleNavigation(link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}

          <a
            href="#contact"
            className="navbar-cta"
            onClick={() => handleNavigation("#contact")}
          >
            Let's Talk
            <ArrowUpRight size={17} />
          </a>

          {/* Mobile Menu Toggle */}

          <button
            type="button"
            className="navbar-menu-toggle"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}

      <div
        className={`navbar-mobile-overlay ${
          menuOpen ? "navbar-mobile-overlay-visible" : ""
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="mobile-navigation"
        className={`navbar-mobile ${menuOpen ? "navbar-mobile-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="navbar-mobile-header">
          <span>MENU</span>

          <ChevronDown size={18} />
        </div>

        <div className="navbar-mobile-links">
          {navigationLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className={`navbar-mobile-link ${
                activeSection === link.href.slice(1)
                  ? "navbar-mobile-link-active"
                  : ""
              }`}
              onClick={() => handleNavigation(link.href)}
            >
              <span className="navbar-mobile-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span>{link.label}</span>

              <ArrowUpRight size={17} />
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="navbar-mobile-cta"
          onClick={() => handleNavigation("#contact")}
        >
          Discuss Your Project
          <ArrowUpRight size={18} />
        </a>

        <div className="navbar-mobile-footer">
          BUILDER 360 · BUILDING THE FUTURE
        </div>
      </nav>
    </>
  );
}

export default PublicNavbar;
