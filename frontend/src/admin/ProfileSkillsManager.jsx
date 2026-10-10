import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { initializeCsrf } from "../services/api";
import "./profile-skills.css";

const emptyProfile = {
  name: "Md Sufiyan",
  role: "Software Developer",
  email: "your.email@example.com",
  location: "Nepal",
  heroIntro: "a developer interested in building useful, thoughtful, and reliable digital products from intuitive interfaces to the systems behind them.",
  aboutLead: "I enjoy the process of turning a problem into something clear, useful, and easy to use.",
  aboutBody: "My interests span frontend development, backend APIs, databases, and the details that make a digital product feel considered. I care about readable code, responsive layouts, and learning the reasoning behind the tools I use.\n\nFor me, development isn't just about making a page work. It's about making the whole experience feel coherent — for the person using it and for the developer maintaining it.",
  experience: "",
  resumeUrl: "",
  githubUrl: "",
  linkedinUrl: "",
};

function profileToForm(profile = {}) {
  return Object.fromEntries(
    Object.keys(emptyProfile).map((key) => [key, profile[key] ?? emptyProfile[key]])
  );
}

const emptySkill = {
  name: "",
  category: "Frontend",
  description: "",
  proficiency: "",
  status: "published",
  sortOrder: "0",
};

function errorMessage(error) {
  const details = error.response?.data?.errors;
  if (Array.isArray(details) && details.length) {
    return details.map((item) => `${item.field}: ${item.message}`).join(" · ");
  }
  return error.response?.data?.message || "Something went wrong. Please try again.";
}

function skillToForm(skill) {
  return {
    name: skill.name || "",
    category: skill.category || "Frontend",
    description: skill.description || "",
    proficiency: skill.proficiency ? String(skill.proficiency) : "",
    status: skill.status || "published",
    sortOrder: String(skill.sortOrder ?? 0),
  };
}

export default function ProfileSkillsManager() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(emptyProfile);
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState(emptySkill);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSkill, setSavingSkill] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [skillError, setSkillError] = useState("");
  const [skillNotice, setSkillNotice] = useState("");

  const loadSkills = useCallback(async (showError = true) => {
    try {
      const response = await api.get("/admin/skills");
      setSkills(Array.isArray(response.data.data) ? response.data.data : []);
      if (showError) setSkillError("");
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }
      if (showError) setSkillError(errorMessage(error));
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;

    async function initializePage() {
      try {
        await initializeCsrf();
        const [profileResponse, skillsResponse] = await Promise.all([
          api.get("/admin/profile"),
          api.get("/admin/skills"),
        ]);
        if (!active) return;
        setProfile(profileToForm(profileResponse.data.data));
        setSkills(Array.isArray(skillsResponse.data.data) ? skillsResponse.data.data : []);
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 401) {
          navigate("/admin/login", { replace: true });
        } else {
          setProfileError(errorMessage(error));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initializePage();
    return () => { active = false; };
  }, [navigate]);

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function handleSkillChange(event) {
    const { name, value } = event.target;
    setSkillForm((current) => ({ ...current, [name]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const response = await api.patch("/admin/profile", profile);
      setProfile(profileToForm(response.data.data || profile));
      setProfileNotice("Profile saved. Your public portfolio will use these details.");
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/admin/login", { replace: true });
      } else {
        setProfileError(errorMessage(error));
      }
    } finally {
      setSavingProfile(false);
    }
  }

  function resetSkillForm() {
    setSkillForm(emptySkill);
    setEditingSkillId(null);
    setSkillError("");
    setSkillNotice("");
  }

  async function handleSkillSubmit(event) {
    event.preventDefault();
    setSavingSkill(true);
    setSkillError("");
    setSkillNotice("");

    const payload = {
      name: skillForm.name.trim(),
      category: skillForm.category.trim(),
      description: skillForm.description.trim(),
      proficiency: Number(skillForm.proficiency || 0),
      status: skillForm.status,
      sortOrder: Number(skillForm.sortOrder || 0),
    };

    try {
      if (editingSkillId) {
        await api.patch(`/admin/skills/${editingSkillId}`, payload);
        setSkillNotice("Skill updated successfully.");
      } else {
        await api.post("/admin/skills", payload);
        setSkillNotice("Skill added successfully.");
      }
      setSkillForm(emptySkill);
      setEditingSkillId(null);
      await loadSkills(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/admin/login", { replace: true });
      } else {
        setSkillError(errorMessage(error));
      }
    } finally {
      setSavingSkill(false);
    }
  }

  function editSkill(skill) {
    setSkillForm(skillToForm(skill));
    setEditingSkillId(skill._id);
    setSkillError("");
    setSkillNotice("");
    document.getElementById("skill-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function deleteSkill(skill) {
    if (!window.confirm(`Delete skill "${skill.name}" permanently?`)) return;
    setSkillError("");
    setSkillNotice("");
    try {
      await api.delete(`/admin/skills/${skill._id}`);
      if (editingSkillId === skill._id) {
        setEditingSkillId(null);
        setSkillForm(emptySkill);
      }
      setSkillNotice("Skill deleted successfully.");
      await loadSkills(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/admin/login", { replace: true });
      } else {
        setSkillError(errorMessage(error));
      }
    }
  }

  async function toggleSkillStatus(skill) {
    const status = skill.status === "published" ? "draft" : "published";
    setSkillError("");
    setSkillNotice("");
    try {
      await api.patch(`/admin/skills/${skill._id}`, { status });
      setSkillNotice(status === "published" ? "Skill published on your website." : "Skill moved to drafts.");
      await loadSkills(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/admin/login", { replace: true });
      } else {
        setSkillError(errorMessage(error));
      }
    }
  }

  const publishedCount = skills.filter((skill) => skill.status === "published").length;

  return (
    <main className="ps-page">
      <header className="ps-header">
        <Link to="/admin/dashboard" className="ps-brand">
          <span className="ps-brand-mark">S.</span>
          <span>PORTFOLIO CMS<small>PROFILE & SKILLS</small></span>
        </Link>
        <div className="ps-header-actions">
          <Link to="/admin/dashboard">← Dashboard</Link>
          <a href="/" target="_blank" rel="noreferrer">View website ↗</a>
        </div>
      </header>

      <div className="ps-container">
        <section className="ps-intro">
          <p className="ps-eyebrow">ADMINISTRATION / PERSONAL BRAND</p>
          <h1>Profile & skills<span>.</span></h1>
          <p>Update the information visitors see on your portfolio, and manage the skills you want to showcase.</p>
          <div className="ps-stats">
            <div><span>PROFILE</span><strong>Editable</strong></div>
            <div><span>TOTAL SKILLS</span><strong>{skills.length}</strong></div>
            <div><span>PUBLISHED SKILLS</span><strong>{publishedCount}</strong></div>
          </div>
        </section>

        {loading ? <p className="ps-message">Loading profile and skills…</p> : null}

        <section className="ps-panel">
          <div className="ps-panel-heading">
            <div><p className="ps-eyebrow">01 / YOUR DETAILS</p><h2>Profile information</h2></div>
            <span>PUBLIC PROFILE</span>
          </div>
          <p className="ps-panel-description">These details are used by the hero, About, Contact, and résumé link on your public website.</p>

          {profileError ? <div className="ps-alert ps-alert-error" role="alert">{profileError}</div> : null}
          {profileNotice ? <div className="ps-alert ps-alert-success" role="status">{profileNotice}</div> : null}

          <form className="ps-form" onSubmit={handleProfileSubmit}>
            <div className="ps-form-grid">
              <label>Name<input name="name" value={profile.name} onChange={handleProfileChange} maxLength={120} required /></label>
              <label>Professional title<input name="role" value={profile.role} onChange={handleProfileChange} maxLength={120} required /></label>
              <label>Email address<input type="email" name="email" value={profile.email} onChange={handleProfileChange} maxLength={254} /></label>
              <label>Location<input name="location" value={profile.location} onChange={handleProfileChange} maxLength={120} /></label>
              <label className="ps-field-wide">Hero introduction<textarea name="heroIntro" value={profile.heroIntro} onChange={handleProfileChange} rows={3} maxLength={1200} /></label>
              <label className="ps-field-wide">About section lead<textarea name="aboutLead" value={profile.aboutLead} onChange={handleProfileChange} rows={2} maxLength={1200} /></label>
              <label className="ps-field-wide">Biography<textarea name="aboutBody" value={profile.aboutBody} onChange={handleProfileChange} rows={5} maxLength={5000} /><small>Use a blank line between paragraphs.</small></label>
              <label className="ps-field-wide">Experience<textarea name="experience" value={profile.experience} onChange={handleProfileChange} rows={4} maxLength={5000} placeholder="Add experience, internship, or relevant work. Use a new line for each paragraph." /><small>Leave blank to hide the experience block.</small></label>
              <label>Résumé URL<input type="url" name="resumeUrl" value={profile.resumeUrl} onChange={handleProfileChange} placeholder="https://…" maxLength={2048} /></label>
              <label>GitHub URL<input type="url" name="githubUrl" value={profile.githubUrl} onChange={handleProfileChange} placeholder="https://github.com/…" maxLength={2048} /></label>
              <label className="ps-field-wide">LinkedIn URL<input type="url" name="linkedinUrl" value={profile.linkedinUrl} onChange={handleProfileChange} placeholder="https://linkedin.com/in/…" maxLength={2048} /></label>
            </div>
            <div className="ps-form-footer"><span>Profile edits are saved to MongoDB.</span><button type="submit" disabled={savingProfile || loading}>{savingProfile ? "Saving profile…" : "Save profile changes"}</button></div>
          </form>
        </section>

        <section className="ps-panel" id="skill-editor">
          <div className="ps-panel-heading">
            <div><p className="ps-eyebrow">02 / CAPABILITIES</p><h2>{editingSkillId ? "Edit skill" : "Add a skill"}</h2></div>
            <span>{publishedCount} LIVE</span>
          </div>
          <p className="ps-panel-description">Published skills appear in the technologies strip on the public portfolio. Draft skills remain private.</p>

          {skillError ? <div className="ps-alert ps-alert-error" role="alert">{skillError}</div> : null}
          {skillNotice ? <div className="ps-alert ps-alert-success" role="status">{skillNotice}</div> : null}

          <form className="ps-form" onSubmit={handleSkillSubmit}>
            <div className="ps-form-grid">
              <label>Skill name<input name="name" value={skillForm.name} onChange={handleSkillChange} maxLength={80} placeholder="e.g. JavaScript" required /></label>
              <label>Category<input name="category" value={skillForm.category} onChange={handleSkillChange} maxLength={80} placeholder="e.g. Frontend" required /></label>
              <label>Description<input name="description" value={skillForm.description} onChange={handleSkillChange} maxLength={500} placeholder="Optional short note" /></label>
              <label>Proficiency (optional, 0–100)<input type="number" name="proficiency" min="0" max="100" step="1" value={skillForm.proficiency} onChange={handleSkillChange} placeholder="Leave blank if not needed" /></label>
              <label>Status<select name="status" value={skillForm.status} onChange={handleSkillChange}><option value="published">Published</option><option value="draft">Draft</option></select></label>
              <label>Display order<input type="number" name="sortOrder" min="0" max="10000" step="1" value={skillForm.sortOrder} onChange={handleSkillChange} /></label>
            </div>
            <div className="ps-form-footer"><span>{editingSkillId ? "Update this skill or cancel editing." : "Add a skill to your portfolio."}</span><div className="ps-button-row"><button type="submit" disabled={savingSkill}>{savingSkill ? "Saving…" : editingSkillId ? "Save skill" : "Add skill"}</button>{editingSkillId ? <button type="button" className="ps-button-secondary" onClick={resetSkillForm}>Cancel</button> : null}</div></div>
          </form>

          <div className="ps-skill-list-heading"><h3>All skills</h3><span>{skills.length} item{skills.length === 1 ? "" : "s"}</span></div>
          {skills.length === 0 && !loading ? <div className="ps-empty"><strong>No skills yet.</strong><p>Add a skill above, then leave it published to show it on the public website.</p></div> : null}
          <div className="ps-skill-list">
            {skills.map((skill) => (
              <article className="ps-skill-row" key={skill._id}>
                <div className="ps-skill-main"><div className="ps-skill-title"><strong>{skill.name}</strong><span className={`ps-status ${skill.status === "published" ? "is-published" : "is-draft"}`}>{skill.status}</span></div><p>{skill.category}{skill.description ? ` · ${skill.description}` : ""}</p></div>
                <div className="ps-skill-actions"><button type="button" className="ps-inline-button" onClick={() => editSkill(skill)}>Edit</button><button type="button" className="ps-inline-button" onClick={() => toggleSkillStatus(skill)}>{skill.status === "published" ? "Unpublish" : "Publish"}</button><button type="button" className="ps-inline-button ps-delete-button" onClick={() => deleteSkill(skill)}>Delete</button></div>
              </article>
            ))}
          </div>
        </section>

        <footer className="ps-footer"><span>PORTFOLIO CMS</span><span>Changes affect the public website.</span></footer>
      </div>
    </main>
  );
}
