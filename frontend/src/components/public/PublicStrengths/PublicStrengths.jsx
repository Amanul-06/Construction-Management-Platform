import {
  ShieldCheck,
  HardHat,
  Clock3,
  Award,
  Truck,
  Users,
} from "lucide-react";

import "./PublicStrengths.css";

const strengths = [
  {
    icon: HardHat,
    number: "01",
    title: "Engineering Excellence",
    description:
      "A structured approach to infrastructure development, with an emphasis on technical precision, efficient execution, and reliable engineering practices.",
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "Safety First",
    description:
      "A strong focus on safe working practices, responsible site management, and maintaining safety standards throughout project execution.",
  },
  {
    icon: Clock3,
    number: "03",
    title: "Timely Execution",
    description:
      "Careful planning, effective coordination, and systematic monitoring to keep project activities aligned with established schedules.",
  },
  {
    icon: Award,
    number: "04",
    title: "Commitment to Quality",
    description:
      "Attention to workmanship, construction processes, and quality control at every stage of infrastructure development.",
  },
  {
    icon: Truck,
    number: "05",
    title: "Resource Management",
    description:
      "Coordinating manpower, machinery, materials, and site operations to support efficient project delivery.",
  },
  {
    icon: Users,
    number: "06",
    title: "Collaborative Approach",
    description:
      "Working closely with clients, consultants, engineers, and project teams to maintain clear communication and shared objectives.",
  },
];

function PublicStrengths() {
  return (
    <section className="public-strengths" id="strengths">
      <div className="strengths-container">
        <div className="strengths-header">
          <div className="strengths-heading">
            <span className="strengths-eyebrow">OUR CORE STRENGTHS</span>

            <h2>
              Built on Strength.
              <br />
              <span>Driven by Excellence.</span>
            </h2>
          </div>

          <div className="strengths-intro">
            <p>
              Successful infrastructure development requires more than
              construction. It demands technical expertise, disciplined
              execution, dependable coordination, and an unwavering commitment
              to quality.
            </p>
          </div>
        </div>

        <div className="strengths-grid">
          {strengths.map((strength) => {
            const Icon = strength.icon;

            return (
              <article className="strength-card" key={strength.number}>
                <div className="strength-card-top">
                  <div className="strength-icon">
                    <Icon size={27} strokeWidth={1.7} />
                  </div>

                  <span className="strength-number">{strength.number}</span>
                </div>

                <h3>{strength.title}</h3>

                <p>{strength.description}</p>

                <div className="strength-card-line"></div>
              </article>
            );
          })}
        </div>

        <div className="strengths-bottom">
          <div className="strengths-bottom-content">
            <span className="strengths-bottom-label">OUR APPROACH</span>

            <h3>
              Precision in planning.
              <br />
              Excellence in execution.
            </h3>
          </div>

          <div className="strengths-bottom-description">
            <p>
              Every project is an opportunity to apply sound engineering
              principles, strengthen partnerships, and contribute to dependable
              infrastructure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PublicStrengths;
