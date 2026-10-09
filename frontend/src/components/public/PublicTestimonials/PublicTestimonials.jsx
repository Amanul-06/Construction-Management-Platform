import "./PublicTestimonials.css";

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Project Director",
    company: "Infrastructure Development",
    text: "Builder 360 demonstrated excellent project coordination and a strong commitment to quality. Their professional approach helped ensure smooth execution throughout the project.",
    rating: 5,
  },
  {
    name: "Amit Verma",
    role: "Construction Manager",
    company: "Highway Development",
    text: "The team maintained high standards of safety, communication, and execution. Their focus on timely delivery and operational efficiency was impressive.",
    rating: 5,
  },
  {
    name: "Sanjay Mehta",
    role: "Engineering Consultant",
    company: "Civil Engineering",
    text: "Their structured approach to infrastructure development and attention to technical details reflect a strong commitment to dependable engineering solutions.",
    rating: 5,
  },
];

function PublicTestimonials() {
  return (
    <section className="public-testimonials" id="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-heading">
          <span className="testimonials-eyebrow">CLIENT TESTIMONIALS</span>

          <h2>
            Trusted Partnerships.
            <br />
            <span>Proven Commitment.</span>
          </h2>

          <p>
            Strong infrastructure begins with strong relationships. We value the
            trust our clients place in us and remain committed to delivering
            quality, reliability, and excellence.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <article
              className="testimonial-card"
              key={testimonial.name}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="testimonial-top">
                <span className="testimonial-quote">“</span>

                <div
                  className="testimonial-rating"
                  aria-label="5 out of 5 stars"
                >
                  {"★".repeat(testimonial.rating)}
                </div>
              </div>

              <p className="testimonial-text">{testimonial.text}</p>

              <div className="testimonial-divider"></div>

              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {testimonial.name.charAt(0)}
                </div>

                <div>
                  <h3>{testimonial.name}</h3>
                  <p>{testimonial.role}</p>
                  <span>{testimonial.company}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="testimonials-bottom">
          <span className="testimonials-bottom-line"></span>

          <p>Building infrastructure. Strengthening relationships.</p>

          <span className="testimonials-bottom-line"></span>
        </div>
      </div>
    </section>
  );
}

export default PublicTestimonials;
