import { ArrowUpRight, MapPin, CalendarDays } from "lucide-react";
import "./PublicProjects.css";

const projects = [
  {
    id: 1,
    name: "Highway Development Project",
    category: "Highways & Roads",
    location: "West Bengal, India",
    status: "Ongoing",
    image: "/images/hero/hero1.jpg",
  },
  {
    id: 2,
    name: "Bridge Construction Project",
    category: "Bridges & Structures",
    location: "India",
    status: "Ongoing",
    image: "/images/hero/hero2.jpg",
  },
  {
    id: 3,
    name: "Infrastructure Development",
    category: "Civil Engineering",
    location: "India",
    status: "Completed",
    image: "/images/hero/hero3.jpg",
  },
];

function PublicProjects() {
  return (
    <section className="public-projects" id="projects">
      <div className="public-projects-container">
        <div className="public-projects-heading">
          <div>
            <span className="public-projects-eyebrow">OUR PORTFOLIO</span>

            <h2>
              Projects That Shape <span>Tomorrow</span>
            </h2>

            <p>
              Explore our infrastructure and construction projects, reflecting
              our commitment to quality, engineering, and reliable project
              execution.
            </p>
          </div>

          <a href="#contact" className="public-projects-view-all">
            Discuss a Project
            <ArrowUpRight size={18} />
          </a>
        </div>

        <div className="public-projects-grid">
          {projects.map((project) => (
            <article className="public-project-card" key={project.id}>
              <div className="public-project-image">
                <img src={project.image} alt={project.name} />

                <span
                  className={`public-project-status ${
                    project.status === "Completed" ? "completed" : "ongoing"
                  }`}
                >
                  <span className="public-project-status-dot"></span>
                  {project.status}
                </span>

                <a
                  href="#contact"
                  className="public-project-arrow"
                  aria-label={`Enquire about ${project.name}`}
                >
                  <ArrowUpRight size={21} />
                </a>
              </div>

              <div className="public-project-info">
                <span className="public-project-category">
                  {project.category}
                </span>

                <h3>{project.name}</h3>

                <div className="public-project-meta">
                  <span>
                    <MapPin size={15} />
                    {project.location}
                  </span>

                  <span>
                    <CalendarDays size={15} />
                    {project.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="public-projects-bottom">
          <p>
            Have an infrastructure project in mind?
            <strong> Let's build something meaningful together.</strong>
          </p>

          <a href="#contact">
            Contact Our Team
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default PublicProjects;
