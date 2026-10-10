import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Home.css";
const defaultProfile = {
  name: "Md Sufiyan",
  role: "Software Developer",
  email: "sufiyanmd9814@gmail.com",
  location: "Nepal",
  heroIntro:
    "a developer interested in building useful, thoughtful, and reliable digital products from intuitive interfaces to the systems behind them.",
  aboutLead:
    "I enjoy the process of turning a problem into something clear, useful, and easy to use.",
  aboutBody:
    "My interests span frontend development, backend APIs, databases, and the details that make a digital product feel considered. I care about readable code, responsive layouts, and learning the reasoning behind the tools I use.\n\nFor me, development isn't just about making a page work. It's about making the whole experience feel coherent — for the person using it and for the developer maintaining it.",
  experience: "",
  resumeUrl: "",
  githubUrl: "",
  linkedinUrl: "",
};
const fallbackTechnologies = [
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "REST APIs",
  "Git & GitHub",
];
const services = [
  {
    number: "01",
    title: "Web experiences",
    description:
      "Responsive, accessible websites with thoughtful layouts, clear messaging, and smooth user experiences.",
    tags: ["UI implementation", "Responsive design"],
  },
  {
    number: "02",
    title: "Backend & APIs",
    description:
      "Structured backend applications, REST APIs, database integration, and practical application logic.",
    tags: ["Node.js", "Express", "MongoDB"],
  },
  {
    number: "03",
    title: "Content-driven products",
    description:
      "Web applications that let people manage content through forms, dashboards, and secure workflows.",
    tags: ["CRUD", "Authentication", "CMS"],
  },
];
function Arrow({ diagonal = false }) {
  return (
    <span aria-hidden="true" className="arrow-symbol">
      {diagonal ? "↗" : "→"}
    </span>
  );
}
function ProjectArtwork({ type }) {
  if (type === "services") {
    return (
      <div className="art-window service-art">
        <div className="art-browser">
          <span />
          <span />
          <span />
          <div className="art-address">onestop / services</div>
        </div>
        <div className="service-art-content">
          <div className="art-mini-label">DIGITAL SERVICES</div>
          <div className="art-heading">
            Everything
            <br />
            in one place<span>.</span>
          </div>
          <div className="art-service-grid">
            <div>
              <span className="art-icon">⌘</span>
              <span>Web</span>
            </div>
            <div>
              <span className="art-icon">文</span>
              <span>Translation</span>
            </div>
            <div>
              <span className="art-icon">↗</span>
              <span>Documents</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="art-window cms-art">
      <div className="art-browser">
        <span />
        <span />
        <span />
        <div className="art-address">portfolio / dashboard</div>
      </div>
      <div className="cms-art-content">
        <div className="cms-sidebar">
          <div className="cms-logo">S.</div>
          <span className="cms-nav-active" />
          <span />
          <span />
          <span />
        </div>
        <div className="cms-main">
          <div className="cms-greeting">
            <div>
              <span>WORKSPACE</span>
              <strong>Content overview</strong>
            </div>
            <div className="cms-avatar">S</div>
          </div>
          <div className="cms-stats">
            <div>
              <span>Projects</span>
              <strong>01</strong>
            </div>
            <div>
              <span>Content</span>
              <strong>CMS</strong>
            </div>
          </div>
          <div className="cms-project-row">
            <span className="cms-project-thumb" />
            <div>
              <strong>Featured project</strong>
              <span>Ready to publish</span>
            </div>
            <span className="cms-status-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}

function getGoogleDriveFileId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (
      host !== "drive.google.com" &&
      host !== "docs.google.com"
    ) {
      return null;
    }

    const match = parsed.pathname.match(
      /\/(?:file|document)\/d\/([^/]+)/
    );

    return match?.[1] || parsed.searchParams.get("id");
  } catch {
    return null;
  }
}

function getCertificateThumbnailUrl(url) {
  if (!url) return null;

  const fileId = getGoogleDriveFileId(url);

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      fileId
    )}&sz=w1200`;
  }

  // Normal image URLs can be displayed directly.
  if (!/\.pdf(?:[?#]|$)/i.test(url)) {
    return url;
  }

  return null;
}

function getGoogleDrivePreviewUrl(url) {
  const fileId = getGoogleDriveFileId(url);

  if (fileId) {
    return `https://drive.google.com/file/d/${encodeURIComponent(
      fileId
    )}/preview`;
  }

  // Preserve official verification URLs and other URLs.
  return url;
}

function CertificateThumbnail({ url, title }) {
  const [usePreview, setUsePreview] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const fileId = getGoogleDriveFileId(url);
  const thumbnailUrl = getCertificateThumbnailUrl(url);
  const isPdf = /\.pdf(?:[?#]|$)/i.test(url || "");

  if (!url || imageFailed) {
    return (
      <div className="certificate-symbol">
        ✳
      </div>
    );
  }

  // If the thumbnail fails, fall back to a PDF preview.
  if (!thumbnailUrl || usePreview) {
    if (fileId || isPdf) {
      return (
        <iframe
          className="certificate-pdf-preview"
          src={getGoogleDrivePreviewUrl(url)}
          title={`${title} certificate preview`}
          loading="lazy"
        />
      );
    }

    return <div className="certificate-symbol">✳</div>;
  }

  return (
    <img
      className="certificate-image"
      src={thumbnailUrl}
      alt={`${title} certificate`}
      loading="lazy"
      onError={() => {
        if (fileId || isPdf) {
          setUsePreview(true);
        } else {
          setImageFailed(true);
        }
      }}
    />
  );
}



export default function Home() {
  // State
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [skills, setSkills] = useState(null);
  // Load published projects
  useEffect(() => {
    let active = true;
    async function loadProjects() {
      try {
        const response = await api.get("/projects");
        if (active) {
          setProjects(
            Array.isArray(response.data?.data)
              ? response.data.data
              : []
          );
          setProjectsError(false);
        }
      } catch (error) {
        if (active) {
          setProjectsError(true);
          console.error("Unable to load projects:", error);
        }
      } finally {
        if (active) {
          setProjectsLoading(false);
        }
      }
    }
    loadProjects();
    return () => {
      active = false;
    };
  }, []);
  // Load profile information
  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const response = await api.get("/profile");
        if (active && response.data?.data) {
          setProfile({
            ...defaultProfile,
            ...response.data.data,
          });
        }
      } catch (error) {
        console.error("Unable to load profile:", error);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, []);
  // Load published skills
  useEffect(() => {
    let active = true;
    async function loadSkills() {
      try {
        const response = await api.get("/skills");
        if (active) {
          setSkills(
            Array.isArray(response.data?.data)
              ? response.data.data
              : []
          );
        }
      } catch (error) {
        if (active) {
          setSkills(null);
          console.error("Unable to load skills:", error);
        }
      }
    }
    loadSkills();
    return () => {
      active = false;
    };
  }, []);
  //certifacte at homepage
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [certificatesError, setCertificatesError] = useState(false);
  useEffect(() => {
    let active = true;
    async function loadCertificates() {
      try {
        const response = await api.get("/certificates");
        if (active) {
          setCertificates(
            Array.isArray(response.data?.data)
              ? response.data.data
              : []
          );
        }
      } catch {
        if (active) {
          setCertificatesError(true);
        }
      } finally {
        if (active) {
          setCertificatesLoading(false);
        }
      }
    }
    loadCertificates();
    return () => {
      active = false;
    };
  }, []);
  // Prepare skills for the technology strip
const visibleTechnologies = [
  ...fallbackTechnologies,
  ...(Array.isArray(skills)
    ? skills.map((skill) => skill.name)
    : []),
].filter(
  (technology, index, allTechnologies) =>
    allTechnologies.findIndex(
      (item) =>
        item.trim().toLowerCase() ===
        technology.trim().toLowerCase()
    ) === index
);
  // Prepare About section paragraphs
  const aboutParagraphs = (profile.aboutBody || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  // Prepare Experience section paragraphs
  const experienceParagraphs = (profile.experience || "")
    .split(/\n\s*\n|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  function closeMenu() {
    setMenuOpen(false);
  }
  return (
    <div className="portfolio-home">
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="#home" onClick={closeMenu}>
            <span className="brand-mark">S.</span>
            <span className="brand-name">
              {(profile.name || defaultProfile.name).toUpperCase()}
              <small>DEVELOPER PORTFOLIO</small>
            </span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
          <nav
            id="primary-navigation"
            className={`nav-links ${menuOpen ? "is-open" : ""}`}
            aria-label="Main navigation"
          >
            <a href="#work" onClick={closeMenu}>Work</a>
            <a href="#certificates" onClick={closeMenu}>
              Certificates
            </a>
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#services" onClick={closeMenu}>What I do</a>
            <a href="#contact" onClick={closeMenu}>Contact</a>
            <Link
              to="/admin/login"
              className="nav-admin"
              onClick={closeMenu}
            >
              Admin <Arrow diagonal />
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              {(profile.role || defaultProfile.role).toUpperCase()}
            </div>
            <h1>
              Ideas into
              <br />
              <span className="hero-highlight">digital</span>
              <br />
              experiences<span className="hero-period">.</span>
            </h1>
            <p className="hero-description">
              I'm <strong>{profile.name || defaultProfile.name}</strong> — {profile.heroIntro || defaultProfile.heroIntro}
            </p>
            <div className="hero-actions">
              <a className="button-primary" href="#work">
                Explore my work <Arrow diagonal />
              </a>
              <a className="button-text" href="#contact">
                Let's connect <Arrow />
              </a>
              {profile.resumeUrl && (
                <a
                  className="button-text"
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View résumé <Arrow diagonal />
                </a>
              )}
            </div>
            <div className="hero-meta">
              <span className="meta-pin" />
              Based in {profile.location || defaultProfile.location}
              <span className="meta-divider">/</span>
              Building for the web
            </div>
          </div>
          <div className="hero-visual" aria-label="Developer workspace illustration">
            <div className="visual-orb orb-one" />
            <div className="visual-orb orb-two" />
            <div className="visual-grid" />
            <div className="floating-label floating-label-top">
              <span className="label-spark">✳</span>
              DESIGNED WITH INTENTION
            </div>
            <div className="code-card">
              <div className="code-card-header">
                <div className="window-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="file-label">developer.js</span>
                <span className="file-language">JS</span>
              </div>
              <div className="code-content">
                <div><span className="line-number">01</span><span className="code-purple">const</span> developer = {"{"}</div>
                <div><span className="line-number">02</span>  name: <span className="code-green">{JSON.stringify(profile.name || defaultProfile.name)}</span>,</div>
                <div><span className="line-number">03</span>  focus: [</div>
                <div><span className="line-number">04</span>    <span className="code-green">"Clean interfaces"</span>,</div>
                <div><span className="line-number">05</span>    <span className="code-green">"Useful products"</span>,</div>
                <div><span className="line-number">06</span>    <span className="code-green">"Reliable systems"</span></div>
                <div><span className="line-number">07</span>  ],</div>
                <div><span className="line-number">08</span>  mindset: <span className="code-blue">"Keep learning"</span></div>
                <div><span className="line-number">09</span>{"}"};</div>
                <div className="code-spacer" />
                <div><span className="line-number">10</span><span className="code-comment">// Make something meaningful.</span></div>
                <div><span className="line-number">11</span><span className="code-purple">build</span>();<span className="code-cursor" /></div>
              </div>
            </div>
            <div className="floating-note floating-note-bottom">
              <span className="note-icon">✳</span>
              <div>
                <strong>Curiosity first.</strong>
                <span>Progress through practice.</span>
              </div>
            </div>
            <div className="visual-index">01 <span>—</span> 04</div>
          </div>
          <a className="scroll-cue" href="#work">
            <span className="scroll-line" />
            SCROLL TO EXPLORE
          </a>
        </section>
        <section className="tech-strip" aria-label="Technologies">
          <div className="tech-strip-inner">
            <span className="tech-strip-title">TOOLS I WORK WITH</span>
            {visibleTechnologies.map((technology) => (
              <span className="tech-item" key={technology}>
                <span className="tech-dot" />
                {technology}
              </span>
            ))}
          </div>
        </section>
        <section className="work-section section-wrap section-space" id="work">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                SELECTED WORK
              </p>
              <h2>
                A few things
                <br />
                <span>I'm building.</span>
              </h2>
            </div>
            <p className="section-intro">
              A selection of web experiences and practical projects that bring
              ideas, interface design, and application logic together.
            </p>
          </div>
          <div className="project-grid">
            {projectsLoading ? (
              <p className="projects-message">Loading projects...</p>
            ) : projectsError ? (
              <p className="projects-message">
                Projects are temporarily unavailable. Please try again later.
              </p>
            ) : projects.length === 0 ? (
              <div className="projects-empty">
                <span className="eyebrow">
                  <span className="eyebrow-line" />
                  THE NEXT CHAPTER
                </span>
                <h3>Good things are in progress.</h3>
                <p>Published projects will appear here automatically.</p>
              </div>
            ) : (
              projects.map((project, index) => (
                <article
                  className="project-card"
                  key={project._id || project.slug}
                >
                  <div
                    className={`project-art project-art-${index % 2 === 0 ? "services" : "cms"
                      }`}
                  >
                    <div className="project-art-topline">
                      <span>
                        {(project.technologies?.slice(0, 3).join(" / ") ||
                          "WEB DEVELOPMENT").toUpperCase()}
                      </span>
                      <span className="project-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {project.imageUrl ? (
                      <img
                        className="project-cover-image"
                        src={project.imageUrl}
                        alt={`${project.title} project preview`}
                        loading="lazy"
                      />
                    ) : (
                      <ProjectArtwork
                        type={index % 2 === 0 ? "services" : "cms"}
                      />
                    )}
                  </div>
                  <div className="project-card-body">
                    <div className="project-title-row">
                      <h3>{project.title}</h3>
                      {project.featured && (
                        <span className="project-status">FEATURED</span>
                      )}
                    </div>
                    <p>{project.description}</p>
                    <div className="project-stack">
                      {(project.technologies || []).map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                    {(project.liveUrl || project.githubUrl) && (
                      <div className="project-links">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Live demo ↗
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Source code ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
          <p className="work-note">
            More projects will be added here as they are published.
          </p>
        </section>
        <section
          className="certificates-section section-wrap section-space"
          id="certificates"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                CERTIFICATES & ACHIEVEMENTS
              </p>
              <h2>
                Learning that
                <br />
                <span>moves me forward.</span>
              </h2>
            </div>
            <p className="section-intro">
              A collection of credentials and achievements representing
              my learning, technical development, and professional growth.
            </p>
          </div>
          {certificatesLoading ? (
            <p className="certificate-message">Loading certificates...</p>
          ) : certificatesError ? (
            <p className="certificate-message">
              Certificates are temporarily unavailable. Please try again later.
            </p>
          ) : certificates.length === 0 ? (
            <div className="certificate-empty">
              <span className="certificate-symbol">✳</span>
              <h3>More achievements are on the way.</h3>
              <p>
                Published certificates will appear here as I continue learning.
              </p>
            </div>
          ) : (
            <div className="certificate-grid">
              {certificates.map((certificate) => (
                <article
                  className="certificate-card"
                  key={certificate._id}
                >
                  <div className="certificate-card-top">
                    <CertificateThumbnail
                      url={certificate.mediaUrl}
                      title={certificate.title}
                    />
                    <span className="certificate-label">
                      VERIFIED LEARNING
                    </span>
                  </div>
                  <div className="certificate-card-body">
                    <p className="certificate-issuer">
                      {certificate.issuer}
                    </p>
                    <h3>{certificate.title}</h3>
                    {certificate.description && (
                      <p className="certificate-description">
                        {certificate.description}
                      </p>
                    )}
                    {certificate.issueDate && (
                      <p className="certificate-date">
                        Issued{" "}
                        {new Date(
                          `${certificate.issueDate}T00:00:00`
                        ).toLocaleDateString("en", {
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </p>
                    )}
                    <div className="certificate-links">
                      {certificate.credentialUrl && (
                        <a
                          href={certificate.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Verify credential ↗
                        </a>
                      )}
                      {certificate.mediaUrl && (
                        <a
    href={getGoogleDrivePreviewUrl(certificate.mediaUrl)}
    target="_blank"
    rel="noopener noreferrer"
  >
                          View certificate ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="about-section section-space" id="about">
          <div className="section-wrap about-grid">
            <div className="about-heading">
              <p className="eyebrow">
                <span className="eyebrow-line" />
                A LITTLE ABOUT ME
              </p>
              <h2>
                Good work starts
                <br />
                with <span>good thinking.</span>
              </h2>
              <div className="about-monogram" aria-hidden="true">S.</div>
            </div>
            <div className="about-copy">
              {profile.aboutLead && (
                <p className="about-lead">{profile.aboutLead}</p>
              )}
              {aboutParagraphs.map((paragraph, index) => (
                <p key={`about-${index}`}>{paragraph}</p>
              ))}
              {experienceParagraphs.length > 0 && (
                <div className="about-experience">
                  <h3>Experience &amp; focus</h3>
                  {experienceParagraphs.map((paragraph, index) => (
                    <p key={`experience-${index}`}>{paragraph}</p>
                  ))}
                </div>
              )}
              <a className="inline-link" href="#contact">
                A little more about working together <Arrow diagonal />
              </a>
              <div className="about-principles">
                <div>
                  <span>01</span>
                  <strong>Clarity</strong>
                  <small>Simple, purposeful experiences.</small>
                </div>
                <div>
                  <span>02</span>
                  <strong>Craft</strong>
                  <small>Care in the details.</small>
                </div>
                <div>
                  <span>03</span>
                  <strong>Growth</strong>
                  <small>Learn, test, improve.</small>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="services-section section-wrap section-space" id="services">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                WHAT I DO
              </p>
              <h2>
                From first idea
                <br />
                to <span>working product.</span>
              </h2>
            </div>
            <p className="section-intro">
              My approach combines user-focused design, dependable
              implementation, and a willingness to keep improving.
            </p>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.number}>
                <div className="service-card-top">
                  <span className="service-number">{service.number}</span>
                  <span className="service-arrow">
                    <Arrow diagonal />
                  </span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-tags">
                  {service.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="approach-section">
          <div className="section-wrap approach-inner">
            <div className="approach-symbol" aria-hidden="true">✳</div>
            <div>
              <p className="eyebrow">THE WAY I LIKE TO WORK</p>
              <h2>
                Think clearly.
                <br />
                Build carefully.
                <br />
                <span>Keep getting better.</span>
              </h2>
            </div>
            <p className="approach-note">
              Start with the problem. Choose the right tools. Build something
              useful. Learn from what happens next.
            </p>
          </div>
        </section>
        <section className="contact-section section-wrap section-space" id="contact">
          <div className="contact-panel">
            <div className="contact-decoration" aria-hidden="true">↗</div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              HAVE SOMETHING IN MIND?
            </p>
            <h2>
              Let's make
              <br />
              something <span>useful.</span>
            </h2>
            <p className="contact-description">
              Have an idea, a project, or an opportunity to discuss?
              I'd be glad to hear from you.
            </p>
            <a
              className="button-primary contact-button"
              href={`mailto:${profile.email || defaultProfile.email}`}
            >
              Get in touch <Arrow diagonal />
            </a>
            <p className="contact-email">{profile.email || defaultProfile.email}</p>
            {(profile.githubUrl || profile.linkedinUrl) && (
              <div className="contact-socials">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                    GitHub ↗
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    LinkedIn ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="section-wrap footer-inner">
          <a className="brand footer-brand" href="#home">
            <span className="brand-mark">S.</span>
            <span className="brand-name">
              {(profile.name || defaultProfile.name).toUpperCase()}
              <small>MADE WITH INTENTION</small>
            </span>
          </a>
          <p>Thoughtfully built. Always evolving.</p>
          <div className="footer-links">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/admin/login">Admin login</Link>
          </div>
          <span className="copyright">
            © {new Date().getFullYear()} {profile.name || defaultProfile.name}
          </span>
        </div>
      </footer>
    </div>
  );
}
