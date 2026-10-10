
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { initializeCsrf } from "../services/api";
import "./admin.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    initializeCsrf()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) {
          setError("Cannot connect to the backend. Check that it is running.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/login", { email, password });
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="login-brand">PORTFOLIO CMS</p>
        <h1>Welcome back</h1>
        <p className="login-subtitle">
          Sign in to manage your portfolio.
        </p>

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          maxLength={254}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p className="login-error" role="alert">{error}</p>}

        <button type="submit" disabled={!ready || loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="login-footer">Private administrator access only</p>
      </form>
    </main>
  );
}
