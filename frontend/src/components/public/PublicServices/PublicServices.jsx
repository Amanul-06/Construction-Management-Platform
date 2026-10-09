import {
  HardHat,
  Route,
  Construction,
  Building2,
  ClipboardCheck,
  Truck,
  ArrowUpRight,
} from "lucide-react";

import "./PublicServices.css";

const services = [
  {
    number: "01",
    icon: Route,
    title: "Highways & Roads",
    description:
      "Infrastructure solutions for highway development, road construction, and transportation connectivity.",
  },
  {
    number: "02",
    icon: Construction,
    title: "Bridges & Structures",
    description:
      "Structural construction solutions focused on engineering precision, durability, and dependable execution.",
  },
  {
    number: "03",
    icon: Building2,
    title: "Civil Construction",
    description:
      "Civil engineering and construction services for infrastructure and development projects.",
  },
  {
    number: "04",
    icon: ClipboardCheck,
    title: "Project Management",
    description:
      "Coordinated project planning, progress monitoring, quality oversight, and execution tracking.",
  },
  {
    number: "05",
    icon: HardHat,
    title: "Engineering & Planning",
    description:
      "Engineering-led planning and technical coordination to support efficient project delivery.",
  },
  {
    number: "06",
    icon: Truck,
    title: "Infrastructure Development",
    description:
      "Integrated infrastructure development focused on practical requirements and long-term value.",
  },
];

function PublicServices() {
  return (
    <section className="public-services" id="services">
      <div className="services-container">
        {/* Section Heading */}
        <div className="services-heading">
          <div className="services-heading-content">
            <span className="services-eyebrow">WHAT WE DO</span>

            <h2>
              Our <span>Services</span>
            </h2>

            <p>
              Infrastructure solutions built around engineering expertise,
              thoughtful planning, and a commitment to quality.
            </p>
          </div>

          <a href="#contact" className="services-heading-link">
            Discuss Your Project
            <ArrowUpRight size={18} />
          </a>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article className="service-card" key={service.number}>
                <div className="service-card-top">
                  <div className="service-icon">
                    <Icon size={29} strokeWidth={1.7} />
                  </div>

                  <span className="service-number">{service.number}</span>
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <a
                  href="#contact"
                  className="service-card-link"
                  aria-label={`Enquire about ${service.title}`}
                >
                  <span>Enquire Now</span>
                  <ArrowUpRight size={18} />
                </a>
              </article>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="services-bottom-banner">
          <div>
            <span className="services-banner-eyebrow">
              HAVE AN INFRASTRUCTURE PROJECT?
            </span>

            <h3>Let's discuss your next project.</h3>
          </div>

          <a href="#contact" className="services-banner-button">
            Get in Touch
            <ArrowUpRight size={19} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default PublicServices;
