
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { initializeCsrf } from "../services/api";
import "./projects.css";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  technologies: "",
  imageUrl: "",
  githubUrl: "",
  liveUrl: "",
  featured: false,
  status: "draft",
  sortOrder: "0",
};

function projectToForm(project) {
  return {
    title: project.title || "",
    slug: project.slug || "",
    description: project.description || "",
    technologies: (project.technologies || []).join(", "),
    imageUrl: project.imageUrl || "",
    githubUrl: project.githubUrl || "",
    liveUrl: project.liveUrl || "",
    featured: Boolean(project.featured),
    status: project.status || "draft",
    sortOrder: String(project.sortOrder ?? 0),
  };
}

function getErrorMessage(error) {
  const details = error.response?.data?.errors;

  if (Array.isArray(details) && details.length) {
    return details
      .map((item) => `${item.field}: ${item.message}`)
      .join(" · ");
  }

  return (
    error.response?.data?.message ||
    "Something went wrong. Please try again."
  );
}

export default function ProjectsManager() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProjects = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/projects");

        setProjects(
          Array.isArray(response.data.data)
            ? response.data.data
            : []
        );
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/admin/login", { replace: true });
          return;
        }

        setError(getErrorMessage(err));
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    let active = true;

    async function initializePage() {
      try {
        await initializeCsrf();

        if (active) {
          await loadProjects();
        }
      } catch {
        if (active) {
          setError("Unable to initialize the secure connection.");
          setLoading(false);
        }
      }
    }

    initializePage();

    return () => {
      active = false;
    };
  }, [loadProjects]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      technologies: form.technologies
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      featured: form.featured,
      status: form.status,
      sortOrder: Number(form.sortOrder || 0),
    };

    // Let the backend generate the slug when the field is empty.
    if (form.slug.trim()) {
      payload.slug = form.slug.trim().toLowerCase();
    }

    try {
      if (editingId) {
        await api.patch(`/admin/projects/${editingId}`, payload);
        setNotice("Project updated successfully.");
      } else {
        await api.post("/admin/projects", payload);
        setNotice("Project created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadProjects({ showLoading: false });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(project) {
    setForm(projectToForm(project));
    setEditingId(project._id);
    setError("");
    setNotice("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Delete "${project.title}" permanently?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/admin/projects/${project._id}`);
      setNotice("Project deleted successfully.");

      if (editingId === project._id) {
        setForm(emptyForm);
        setEditingId(null);
      }

      await loadProjects({ showLoading: false });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(getErrorMessage(err));
    }
  }

  async function togglePublish(project) {
    setError("");
    setNotice("");

    const nextStatus =
      project.status === "published" ? "draft" : "published";

    try {
      await api.patch(`/admin/projects/${project._id}`, {
        status: nextStatus,
      });

      setNotice(
        nextStatus === "published"
          ? "Project published successfully."
          : "Project moved back to drafts."
      );

      await loadProjects({ showLoading: false });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(getErrorMessage(err));
    }
  }

  const publishedCount = projects.filter(
    (project) => project.status === "published"
  ).length;

  const draftCount = projects.length - publishedCount;

  return (
    <main className="pm-page">
      <header className="pm-header">
        <Link to="/admin/dashboard" className="pm-brand">
          <span className="pm-brand-mark">S.</span>
          <span>
            PORTFOLIO CMS
            <small>CONTENT MANAGEMENT</small>
          </span>
        </Link>

        <nav className="pm-header-nav">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/" target="_blank" rel="noreferrer">
            View website ↗
          </Link>
        </nav>
      </header>

      <div className="pm-container">
        <div className="pm-page-heading">
          <div>
            <p className="pm-eyebrow">CONTENT / PROJECTS</p>
            <h1>Manage projects<span>.</span></h1>
            <p className="pm-subtitle">
              Create your work once. Publish it when it is ready.
            </p>
          </div>

          <button
            type="button"
            className="pm-button pm-button-secondary"
            onClick={() => loadProjects()}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        <section className="pm-stats">
          <div className="pm-stat-card">
            <span>Total projects</span>
            <strong>{projects.length}</strong>
          </div>

          <div className="pm-stat-card">
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </div>

          <div className="pm-stat-card">
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
        </section>

        {error && (
          <div className="pm-alert pm-alert-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="pm-alert pm-alert-success" role="status">
            {notice}
          </div>
        )}

        <div className="pm-layout">
          <section className="pm-panel pm-editor">
            <div className="pm-panel-heading">
              <div>
                <p className="pm-eyebrow">
                  {editingId ? "EDIT CONTENT" : "NEW CONTENT"}
                </p>
                <h2>{editingId ? "Edit project" : "Add a project"}</h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  className="pm-text-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="pm-form">
              <div className="pm-field">
                <label htmlFor="project-title">Project title *</label>
                <input
                  id="project-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. OneStop Solution"
                  maxLength={120}
                  required
                />
              </div>

              <div className="pm-field">
                <label htmlFor="project-slug">URL slug</label>
                <input
                  id="project-slug"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="Generated from the title if blank"
                />
                <small>Use lowercase letters, numbers and hyphens.</small>
              </div>

              <div className="pm-field">
                <label htmlFor="project-description">Description *</label>
                <textarea
                  id="project-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What does this project do? What did you build?"
                  rows={5}
                  maxLength={5000}
                  required
                />
              </div>

              <div className="pm-field">
                <label htmlFor="project-technologies">
                  Technologies
                </label>
                <input
                  id="project-technologies"
                  name="technologies"
                  value={form.technologies}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB"
                />
                <small>Separate each technology with a comma.</small>
              </div>

              <div className="pm-field">
                <label htmlFor="project-image">Image URL</label>
                <input
                  id="project-image"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/project.png"
                />
                <small>
                  Paste an existing image URL. File uploads will be added
                  separately.
                </small>
              </div>

              <div className="pm-field">
                <label htmlFor="project-github">GitHub URL</label>
                <input
                  id="project-github"
                  name="githubUrl"
                  type="url"
                  value={form.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username/repository"
                />
              </div>

              <div className="pm-field">
                <label htmlFor="project-live">Live demo URL</label>
                <input
                  id="project-live"
                  name="liveUrl"
                  type="url"
                  value={form.liveUrl}
                  onChange={handleChange}
                  placeholder="https://your-project.example"
                />
              </div>

              <div className="pm-form-row">
                <div className="pm-field">
                  <label htmlFor="project-status">Visibility</label>
                  <select
                    id="project-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="pm-field">
                  <label htmlFor="project-order">Sort order</label>
                  <input
                    id="project-order"
                    name="sortOrder"
                    type="number"
                    min="0"
                    max="10000"
                    step="1"
                    value={form.sortOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label className="pm-checkbox">
                <input
                  name="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={handleChange}
                />
                <span>Feature this project on the homepage</span>
              </label>

              <div className="pm-form-actions">
                <button
                  className="pm-button pm-button-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create project"}
                </button>

                <button
                  className="pm-button pm-button-secondary"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Clear form
                </button>
              </div>
            </form>
          </section>

          <section className="pm-project-list">
            <div className="pm-panel-heading pm-list-heading">
              <div>
                <p className="pm-eyebrow">YOUR WORK</p>
                <h2>All projects</h2>
              </div>
              <span className="pm-count">{projects.length} total</span>
            </div>

            {loading ? (
              <div className="pm-panel pm-empty">
                Loading your projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="pm-panel pm-empty">
                <span className="pm-empty-icon">＋</span>
                <h3>Your first project starts here.</h3>
                <p>
                  Use the form to add a project. Save it as a draft or publish
                  it to your public homepage.
                </p>
              </div>
            ) : (
              <div className="pm-project-items">
                {projects.map((project) => (
                  <article className="pm-project-item" key={project._id}>
                    <div className="pm-project-image">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span>S.</span>
                      )}
                    </div>

                    <div className="pm-project-info">
                      <div className="pm-project-title-line">
                        <h3>{project.title}</h3>
                        <span
                          className={`pm-status ${
                            project.status === "published"
                              ? "is-published"
                              : "is-draft"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <p>{project.description}</p>

                      <div className="pm-project-meta">
                        {project.featured && <span>★ Featured</span>}
                        <span>
                          Updated{" "}
                          {project.updatedAt
                            ? new Date(project.updatedAt).toLocaleDateString()
                            : "recently"}
                        </span>
                      </div>

                      <div className="pm-project-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePublish(project)}
                        >
                          {project.status === "published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          className="pm-delete-button"
                          onClick={() => handleDelete(project)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
