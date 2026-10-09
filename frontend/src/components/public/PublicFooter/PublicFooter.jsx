import {
  HardHat,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ArrowUp,
  LockKeyhole,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./PublicFooter.css";

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#about" },
    { label: "Our Services", href: "#services" },
    { label: "Our Projects", href: "#projects" },
    { label: "Our Strengths", href: "#strengths" },
    { label: "Contact Us", href: "#contact" },
  ];

  const serviceLinks = [
    { label: "Infrastructure Development", href: "#services" },
    { label: "Construction & Engineering", href: "#services" },
    { label: "Project Management", href: "#services" },
    { label: "Roads & Highways", href: "#services" },
    { label: "Civil Engineering", href: "#services" },
    { label: "Site Development", href: "#services" },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="public-footer">
      {/* Main Footer */}

      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Company Information */}

            <div className="footer-company">
              <a
                href="#home"
                className="footer-brand"
                aria-label="Builder 360 Home"
              >
                <div className="footer-brand-icon">
                  <HardHat size={29} strokeWidth={1.8} />
                </div>

                <div className="footer-brand-text">
                  <span className="footer-brand-name">
                    BUILDER<span>360</span>
                  </span>

                  <span className="footer-brand-tagline">
                    BUILDING THE FUTURE
                  </span>
                </div>
              </a>

              <p className="footer-description">
                Building infrastructure that moves communities forward. We are
                committed to quality construction, engineering excellence, and
                delivering projects built to last.
              </p>

              <a href="#contact" className="footer-enquiry-button">
                Discuss Your Project
                <ArrowUpRight size={18} />
              </a>
            </div>

            {/* Quick Links */}

            <div className="footer-column">
              <h3 className="footer-heading">Quick Links</h3>

              <div className="footer-link-list">
                {quickLinks.map((link) => (
                  <a key={link.label} href={link.href} className="footer-link">
                    <ChevronRight size={14} />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}

            <div className="footer-column">
              <h3 className="footer-heading">Our Services</h3>

              <div className="footer-link-list">
                {serviceLinks.map((link) => (
                  <a key={link.label} href={link.href} className="footer-link">
                    <ChevronRight size={14} />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Information */}

            <div className="footer-column footer-contact-column">
              <h3 className="footer-heading">Get In Touch</h3>

              <p className="footer-contact-intro">
                Have a project in mind? Let's discuss how we can work together.
              </p>

              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <span className="footer-contact-label">Our Office</span>

                    <p>
                      Add your registered
                      <br />
                      office address
                    </p>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <Phone size={18} />
                  </div>

                  <div>
                    <span className="footer-contact-label">Phone</span>

                    <p>Add your business phone number</p>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="footer-contact-icon">
                    <Mail size={18} />
                  </div>

                  <div>
                    <span className="footer-contact-label">Email</span>

                    <p>Add your business email address</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA Banner */}

          <div className="footer-cta-banner">
            <div className="footer-cta-content">
              <span className="footer-cta-eyebrow">
                LET'S BUILD SOMETHING GREAT
              </span>

              <h3>Your next project starts with a conversation.</h3>
            </div>

            <a href="#contact" className="footer-cta-link">
              Start a Conversation
              <ArrowUpRight size={19} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="footer-copyright">
            © {currentYear} Builder 360. All rights reserved.
          </p>

          <p className="footer-built-text">
            Built on quality. Driven by excellence.
          </p>

          {/* Admin Login */}

          <Link to="/admin/login" className="footer-admin-login">
            <LockKeyhole size={15} />
            <span>Admin Login</span>
            <ArrowUpRight size={14} />
          </Link>

          {/* Back to Top */}

          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>Back to Top</span>
            <ArrowUp size={17} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
