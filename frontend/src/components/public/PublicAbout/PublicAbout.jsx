import "./PublicAbout.css";

function PublicAbout() {
  return (
    <section className="public-about" id="about">
      <div className="about-container">
        {/* Left: Image */}
        <div className="about-image-wrapper">
          <img
            src="/images/hero/hero2.jpg"
            alt="Infrastructure construction project"
            className="about-image"
          />

          <div className="about-image-overlay">
            <span className="about-image-label">ENGINEERING THE FUTURE</span>
          </div>

          <div className="about-image-accent"></div>
        </div>

        {/* Right: Content */}
        <div className="about-content">
          <span className="about-eyebrow">ABOUT BUILDER360</span>

          <h2>
            Building Infrastructure.
            <br />
            <span>Creating Possibilities.</span>
          </h2>

          <p className="about-description">
            Infrastructure is the foundation of progress. At Builder360, we
            believe that every road, bridge, and construction project plays a
            vital role in connecting people and creating opportunities.
          </p>

          <p className="about-description">
            Our focus is on engineering excellence, quality execution, and
            reliable project delivery. We aim to support infrastructure
            development through professional management, technical expertise,
            and a commitment to getting the fundamentals right.
          </p>

          <div className="about-highlights">
            <div className="about-highlight">
              <span className="about-highlight-number">01</span>

              <div>
                <h3>Engineering Excellence</h3>
                <p>Thoughtful planning and engineering-led execution.</p>
              </div>
            </div>

            <div className="about-highlight">
              <span className="about-highlight-number">02</span>

              <div>
                <h3>Quality & Reliability</h3>
                <p>
                  A strong focus on quality, accountability, and consistency.
                </p>
              </div>
            </div>

            <div className="about-highlight">
              <span className="about-highlight-number">03</span>

              <div>
                <h3>Infrastructure for Tomorrow</h3>
                <p>
                  Building with long-term value and practical impact in mind.
                </p>
              </div>
            </div>
          </div>

          <a href="#services" className="about-button">
            Explore Our Expertise <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default PublicAbout;
