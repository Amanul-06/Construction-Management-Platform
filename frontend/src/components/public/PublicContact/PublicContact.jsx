import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  Send,
  CheckCircle2,
} from "lucide-react";

import "./PublicContact.css";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "New Project Enquiry",
  message: "",
};

function PublicContact() {
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState("idle");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setStatus("submitting");

    // The backend integration will be connected separately.
    // Prevent the form from claiming an enquiry was delivered
    // when no backend endpoint has been configured.

    setStatus("error");
  };

  const contactDetails = [
    {
      icon: MapPin,
      title: "Our Office",
      value: "Add your registered office address",
      href: null,
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "Add your business phone number",
      href: null,
    },
    {
      icon: Mail,
      title: "Email Us",
      value: "Add your business email address",
      href: null,
    },
    {
      icon: Clock,
      title: "Working Hours",
      value: "Monday – Saturday",
      href: null,
    },
  ];

  return (
    <section className="public-contact" id="contact">
      <div className="public-contact-container">
        {/* Section Heading */}

        <div className="contact-heading">
          <span className="contact-eyebrow">LET'S BUILD TOGETHER</span>

          <h2>
            Have a Project
            <br />
            <span>in Mind?</span>
          </h2>

          <p>
            Tell us about your infrastructure project, requirements, or
            partnership opportunity. Our team can review your enquiry and
            discuss the next steps.
          </p>
        </div>

        {/* Contact Layout */}

        <div className="contact-layout">
          {/* Contact Information */}

          <aside className="contact-information">
            <div className="contact-information-heading">
              <span className="contact-information-eyebrow">GET IN TOUCH</span>

              <h3>
                Let's start a
                <br />
                conversation.
              </h3>

              <p>
                Reach out to discuss your project requirements and learn more
                about our infrastructure services.
              </p>
            </div>

            <div className="contact-details">
              {contactDetails.map((detail) => {
                const Icon = detail.icon;

                return (
                  <div className="contact-detail" key={detail.title}>
                    <div className="contact-detail-icon">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>

                    <div className="contact-detail-content">
                      <h4>{detail.title}</h4>

                      {detail.href ? (
                        <a href={detail.href}>{detail.value}</a>
                      ) : (
                        <p>{detail.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="contact-information-bottom">
              <span className="contact-information-line"></span>

              <p>Building the foundations of tomorrow.</p>
            </div>
          </aside>

          {/* Contact Form */}

          <div className="contact-form-wrapper">
            <div className="contact-form-heading">
              <h3>Send Us an Enquiry</h3>

              <p>Fill in the details below and tell us how we can help.</p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">
                    Full Name <span>*</span>
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">
                    Email Address <span>*</span>
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="contact-phone">Phone Number</label>

                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    maxLength={25}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-company">Company Name</label>

                  <input
                    id="contact-company"
                    type="text"
                    name="company"
                    placeholder="Your company"
                    value={formData.company}
                    onChange={handleChange}
                    autoComplete="organization"
                    maxLength={150}
                  />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">
                  Enquiry Type <span>*</span>
                </label>

                <select
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="New Project Enquiry">
                    New Project Enquiry
                  </option>

                  <option value="Infrastructure Development">
                    Infrastructure Development
                  </option>

                  <option value="Construction Services">
                    Construction Services
                  </option>

                  <option value="Business Partnership">
                    Business Partnership
                  </option>

                  <option value="General Enquiry">General Enquiry</option>
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">
                  Project Details <span>*</span>
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Tell us about your project, location, requirements, and expected timeline..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  minLength={10}
                  maxLength={3000}
                />

                <span className="contact-character-count">
                  {formData.message.length}/3000 characters
                </span>
              </div>

              {status === "error" && (
                <div className="contact-form-error" role="alert">
                  The enquiry form is not connected to the server yet. Please
                  configure the backend integration before accepting enquiries.
                </div>
              )}

              {status === "success" && (
                <div className="contact-form-success" role="status">
                  <CheckCircle2 size={20} />

                  <span>Your enquiry has been submitted successfully.</span>
                </div>
              )}

              <button
                type="submit"
                className="contact-submit-button"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Submitting..." : "Send Enquiry"}

                <Send size={17} />
              </button>

              <p className="contact-form-note">
                Fields marked with <span>*</span> are required.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom CTA */}

        <div className="contact-bottom-banner">
          <div>
            <span className="contact-bottom-eyebrow">
              READY TO GET STARTED?
            </span>

            <h3>Your next project starts with a conversation.</h3>
          </div>

          <a href="#home" className="contact-back-to-top">
            Back to Top
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default PublicContact;
