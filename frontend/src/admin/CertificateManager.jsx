
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { initializeCsrf } from "../services/api";
import "./certificates.css";

const emptyForm = {
  title: "",
  issuer: "",
  description: "",
  issueDate: "",
  expiryDate: "",
  credentialId: "",
  credentialUrl: "",
  mediaUrl: "",
  status: "draft",
  sortOrder: "0",
};

function toForm(certificate) {
  return {
    title: certificate.title || "",
    issuer: certificate.issuer || "",
    description: certificate.description || "",
    issueDate: certificate.issueDate || "",
    expiryDate: certificate.expiryDate || "",
    credentialId: certificate.credentialId || "",
    credentialUrl: certificate.credentialUrl || "",
    mediaUrl: certificate.mediaUrl || "",
    status: certificate.status || "draft",
    sortOrder: String(certificate.sortOrder ?? 0),
  };
}

function errorMessage(error) {
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

export default function CertificateManager() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCertificates = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    setError("");

    try {
      const response = await api.get("/admin/certificates");

      setCertificates(
        Array.isArray(response.data.data)
          ? response.data.data
          : []
      );
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(errorMessage(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;

    async function initializePage() {
      try {
        await initializeCsrf();

        if (active) {
          await loadCertificates();
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
  }, [loadCertificates]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
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
      issuer: form.issuer.trim(),
      description: form.description.trim(),
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      credentialId: form.credentialId.trim(),
      credentialUrl: form.credentialUrl.trim(),
      mediaUrl: form.mediaUrl.trim(),
      status: form.status,
      sortOrder: Number(form.sortOrder || 0),
    };

    try {
      if (editingId) {
        await api.patch(
          `/admin/certificates/${editingId}`,
          payload
        );
        setNotice("Certificate updated successfully.");
      } else {
        await api.post("/admin/certificates", payload);
        setNotice("Certificate created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadCertificates(false);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(certificate) {
    setForm(toForm(certificate));
    setEditingId(certificate._id);
    setError("");
    setNotice("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(certificate) {
    const confirmed = window.confirm(
      `Permanently delete "${certificate.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/admin/certificates/${certificate._id}`);

      if (editingId === certificate._id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setNotice("Certificate deleted successfully.");
      await loadCertificates(false);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(errorMessage(err));
    }
  }

  async function togglePublish(certificate) {
    const nextStatus =
      certificate.status === "published" ? "draft" : "published";

    setError("");
    setNotice("");

    try {
      await api.patch(
        `/admin/certificates/${certificate._id}`,
        { status: nextStatus }
      );

      setNotice(
        nextStatus === "published"
          ? "Certificate published successfully."
          : "Certificate moved to drafts."
      );

      await loadCertificates(false);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(errorMessage(err));
    }
  }

  const publishedCount = certificates.filter(
    (certificate) => certificate.status === "published"
  ).length;

  const draftCount = certificates.length - publishedCount;

  return (
    <main className="cert-page">
      <header className="cert-header">
        <Link to="/admin/dashboard" className="cert-brand">
          <span className="cert-brand-mark">S.</span>
          <span>
            PORTFOLIO CMS
            <small>CONTENT MANAGEMENT</small>
          </span>
        </Link>

        <nav className="cert-nav">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/projects">Projects</Link>
          <Link to="/" target="_blank" rel="noreferrer">
            View website ↗
          </Link>
        </nav>
      </header>

      <div className="cert-container">
        <section className="cert-page-heading">
          <div>
            <p className="cert-eyebrow">CONTENT / CREDENTIALS</p>
            <h1>Certificates<span>.</span></h1>
            <p>
              Keep your qualifications, achievements, and credentials
              organized in one place.
            </p>
          </div>

          <button
            className="cert-button cert-button-secondary"
            type="button"
            onClick={() => loadCertificates()}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </section>

        <section className="cert-stats">
          <div>
            <span>Total certificates</span>
            <strong>{certificates.length}</strong>
          </div>
          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </div>
          <div>
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
        </section>

        {error && (
          <div className="cert-alert cert-alert-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="cert-alert cert-alert-success" role="status">
            {notice}
          </div>
        )}

        <div className="cert-layout">
          <section className="cert-panel cert-editor">
            <div className="cert-panel-heading">
              <div>
                <p className="cert-eyebrow">
                  {editingId ? "EDIT CREDENTIAL" : "NEW CREDENTIAL"}
                </p>
                <h2>
                  {editingId ? "Edit certificate" : "Add a certificate"}
                </h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  className="cert-text-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

            <form className="cert-form" onSubmit={handleSubmit}>
              <div className="cert-field">
                <label htmlFor="cert-title">Certificate title *</label>
                <input
                  id="cert-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. JavaScript Certification"
                  maxLength={180}
                  required
                />
              </div>

              <div className="cert-field">
                <label htmlFor="cert-issuer">Issuing organization *</label>
                <input
                  id="cert-issuer"
                  name="issuer"
                  value={form.issuer}
                  onChange={handleChange}
                  placeholder="e.g. freeCodeCamp"
                  maxLength={120}
                  required
                />
              </div>

              <div className="cert-field">
                <label htmlFor="cert-description">Description</label>
                <textarea
                  id="cert-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={3000}
                  placeholder="What did you learn or achieve?"
                />
              </div>

              <div className="cert-form-row">
                <div className="cert-field">
                  <label htmlFor="cert-issue-date">Issue date</label>
                  <input
                    type="date"
                    id="cert-issue-date"
                    name="issueDate"
                    value={form.issueDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="cert-field">
                  <label htmlFor="cert-expiry-date">Expiry date</label>
                  <input
                    type="date"
                    id="cert-expiry-date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="cert-field">
                <label htmlFor="cert-credential-id">Credential ID</label>
                <input
                  id="cert-credential-id"
                  name="credentialId"
                  value={form.credentialId}
                  onChange={handleChange}
                  maxLength={120}
                  placeholder="Optional certificate identifier"
                />
              </div>

              <div className="cert-field">
                <label htmlFor="cert-credential-url">
                  Verification URL
                </label>
                <input
                  id="cert-credential-url"
                  type="url"
                  name="credentialUrl"
                  value={form.credentialUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="cert-field">
                <label htmlFor="cert-media-url">
                  Certificate image or PDF URL
                </label>
                <input
                  id="cert-media-url"
                  type="url"
                  name="mediaUrl"
                  value={form.mediaUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <small>
                  Paste an existing HTTPS URL. Direct file uploads can be
                  added separately.
                </small>
              </div>

              <div className="cert-form-row">
                <div className="cert-field">
                  <label htmlFor="cert-status">Visibility</label>
                  <select
                    id="cert-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="cert-field">
                  <label htmlFor="cert-order">Sort order</label>
                  <input
                    id="cert-order"
                    type="number"
                    name="sortOrder"
                    min="0"
                    max="10000"
                    step="1"
                    value={form.sortOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="cert-form-actions">
                <button
                  type="submit"
                  className="cert-button cert-button-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create certificate"}
                </button>

                <button
                  type="button"
                  className="cert-button cert-button-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Clear form
                </button>
              </div>
            </form>
          </section>

          <section className="cert-list-section">
            <div className="cert-panel-heading cert-list-heading">
              <div>
                <p className="cert-eyebrow">YOUR CREDENTIALS</p>
                <h2>All certificates</h2>
              </div>
              <span className="cert-total">{certificates.length} total</span>
            </div>

            {loading ? (
              <div className="cert-panel cert-empty">
                Loading certificates...
              </div>
            ) : certificates.length === 0 ? (
              <div className="cert-panel cert-empty">
                <span className="cert-empty-symbol">＋</span>
                <h3>Your achievements start here.</h3>
                <p>
                  Add your first certificate, save it as a draft,
                  and publish it when you're ready.
                </p>
              </div>
            ) : (
              <div className="cert-items">
                {certificates.map((certificate) => (
                  <article className="cert-item" key={certificate._id}>
                    <div className="cert-item-symbol">
                      {certificate.mediaUrl ? (
                        <img src={certificate.mediaUrl} alt="" loading="lazy" />
                      ) : (
                        <span>✳</span>
                      )}
                    </div>

                    <div className="cert-item-content">
                      <div className="cert-item-title">
                        <h3>{certificate.title}</h3>
                        <span
                          className={`cert-status ${
                            certificate.status === "published"
                              ? "is-published"
                              : "is-draft"
                          }`}
                        >
                          {certificate.status}
                        </span>
                      </div>

                      <p className="cert-issuer">{certificate.issuer}</p>

                      {certificate.issueDate && (
                        <p className="cert-date">
                          Issued: {certificate.issueDate}
                        </p>
                      )}

                      <div className="cert-item-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(certificate)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePublish(certificate)}
                        >
                          {certificate.status === "published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          className="cert-delete-button"
                          onClick={() => handleDelete(certificate)}
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
