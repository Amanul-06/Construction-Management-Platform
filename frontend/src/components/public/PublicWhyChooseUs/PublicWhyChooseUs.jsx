import {
  Target,
  ShieldCheck,
  Users,
  TrendingUp,
  ClipboardCheck,
  HardHat,
  ArrowUpRight,
} from "lucide-react";

import "./PublicWhyChooseUs.css";

const reasons = [
  {
    icon: Target,
    title: "Focused Project Execution",
    description:
      "A structured approach to project planning, coordination, and execution that keeps every stage aligned with defined objectives.",
  },
  {
    icon: ShieldCheck,
    title: "Quality & Safety",
    description:
      "Attention to construction quality, responsible site practices, and safety considerations throughout project activities.",
  },
  {
    icon: Users,
    title: "Collaborative Teamwork",
    description:
      "Coordination among engineers, site teams, consultants, and clients to support clear communication and efficient delivery.",
  },
  {
    icon: TrendingUp,
    title: "Operational Efficiency",
    description:
      "Thoughtful management of resources, schedules, and site operations to help minimise delays and improve productivity.",
  },
  {
    icon: ClipboardCheck,
    title: "Transparent Processes",
    description:
      "Organised project information, progress monitoring, and systematic communication to help stakeholders stay informed.",
  },
  {
    icon: HardHat,
    title: "Infrastructure Expertise",
    description:
      "A practical, engineering-focused approach to infrastructure development, with attention to site conditions and project requirements.",
  },
];

function PublicWhyChooseUs() {
  return (
    <section className="public-why-choose-us" id="why-choose-us">
      <div className="why-choose-container">
        {/* Section Heading */}

        <div className="why-choose-header">
          <div className="why-choose-heading">
            <span className="why-choose-eyebrow">WHY BUILDER 360</span>

            <h2>
              Why Choose
              <br />
              <span>Builder 360?</span>
            </h2>
          </div>

          <div className="why-choose-intro">
            <p>
              Infrastructure projects demand careful planning, dependable
              coordination, and a commitment to getting the details right. Our
              approach brings these priorities together to support successful
              project delivery.
            </p>

            <a href="#contact" className="why-choose-link">
              Discuss Your Project
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>

        {/* Reasons Grid */}

        <div className="why-choose-grid">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;

            return (
              <article className="why-choose-card" key={reason.title}>
                <div className="why-choose-card-header">
                  <div className="why-choose-icon">
                    <Icon size={26} strokeWidth={1.7} />
                  </div>

                  <span className="why-choose-number">0{index + 1}</span>
                </div>

                <h3>{reason.title}</h3>

                <p>{reason.description}</p>

                <div className="why-choose-card-accent"></div>
              </article>
            );
          })}
        </div>

        {/* Closing Banner */}

        <div className="why-choose-banner">
          <div className="why-choose-banner-content">
            <span className="why-choose-banner-label">
              YOUR PROJECT. OUR COMMITMENT.
            </span>

            <h3>
              Let's build something
              <br />
              that lasts.
            </h3>
          </div>

          <a href="#contact" className="why-choose-banner-button">
            Start a Conversation
            <ArrowUpRight size={19} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default PublicWhyChooseUs;
