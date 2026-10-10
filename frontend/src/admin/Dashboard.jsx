
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { initializeCsrf } from "../services/api";
import "./dashboard.css";

const sections = [
  {
    icon: "01",
    title: "Projects",
    description: "Showcase your work, technologies, GitHub repositories, and live demos.",
    path: "/admin/projects",
    action: "Manage projects",
    available: true,
  },
  {
    icon: "02",
    title: "Certificates",
    description: "Organize your certificates, credentials, and professional achievements.",
    path: "/admin/certificates",
    action: "Manage Certificates",
    available: true,
  },
  {
    icon: "03",
    title: "Blog articles",
    description: "Write articles, save drafts, and publish technical tutorials.",
    path: null,
    action: "Coming next",
    available: false,
  },
  {
    icon: "04",
    title: "Profile & skills",
    description: "Update your biography, technical skills, résumé, and experience.",
    path: "/admin/profile-skills",
    action: "Manage profile & skills",
    available: true,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    initializeCsrf()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) {
          setError("Unable to initialize secure requests. Refresh the page.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await api.post("/auth/logout");
      navigate("/admin/login", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message || "Logout failed. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/admin/dashboard" className="dashboard-brand">
          <span className="dashboard-brand-mark">S.</span>
          <span>
            PORTFOLIO CMS
            <small>PERSONAL WORKSPACE</small>
          </span>
        </Link>

        <div className="dashboard-header-actions">
          <a href="/" target="_blank" rel="noreferrer">
            View public website ↗
          </a>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
            disabled={!ready || loggingOut}
          >
            {loggingOut ? "Signing out..." : "Log out"}
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">ADMINISTRATION / OVERVIEW</p>
            <h1>
              Your workspace<span>.</span>
            </h1>
            <p className="dashboard-description">
              Manage your portfolio content, organize your work, and decide
              what the world gets to see.
            </p>
          </div>

          <div className="dashboard-status">
            <span className="dashboard-status-dot" />
            Private workspace
          </div>
        </section>

        {error && (
          <div className="dashboard-error" role="alert">
            {error}
          </div>
        )}

        <section className="dashboard-overview">
          <div>
            <span className="dashboard-overview-label">CONTENT</span>
            <strong>Manage</strong>
            <span className="dashboard-overview-note">
              Update your public portfolio
            </span>
          </div>

          <div>
            <span className="dashboard-overview-label">PUBLISHING</span>
            <strong>Control</strong>
            <span className="dashboard-overview-note">
              Work with drafts and published content
            </span>
          </div>

          <div>
            <span className="dashboard-overview-label">ACCESS</span>
            <strong>Private</strong>
            <span className="dashboard-overview-note">
              Administrator session required
            </span>
          </div>
        </section>

        <section className="dashboard-content">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">YOUR CONTENT</p>
              <h2>Content management</h2>
            </div>

            <span className="dashboard-section-count">04 MODULES</span>
          </div>

          <div className="dashboard-module-grid">
            {sections.map((section) => (
              <article
                key={section.icon}
                className={`dashboard-module ${
                  section.available ? "dashboard-module-active" : ""
                }`}
              >
                <div className="dashboard-module-top">
                  <span className="dashboard-module-number">
                    {section.icon}
                  </span>

                  <span className="dashboard-module-arrow">
                    {section.available ? "↗" : "○"}
                  </span>
                </div>

                <h3>{section.title}</h3>
                <p>{section.description}</p>

                {section.available ? (
                  <Link
                    to={section.path}
                    className="dashboard-module-link"
                  >
                    {section.action}
                    <span>→</span>
                  </Link>
                ) : (
                  <span className="dashboard-module-disabled">
                    {section.action}
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-tip">
          <span className="dashboard-tip-icon">✳</span>
          <div>
            <strong>Your portfolio, your control.</strong>
            <p>
              Create a project, review it as a draft, and publish it when
              you're ready for visitors to see it.
            </p>
          </div>
          <Link to="/admin/projects">Start with projects →</Link>
        </section>

        <footer className="dashboard-footer">
          <span>PORTFOLIO CMS</span>
          <span>Built for continuous growth.</span>
        </footer>
      </div>
    </main>
  );
}
