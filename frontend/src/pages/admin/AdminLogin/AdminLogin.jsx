import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HardHat, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Backend authentication will be connected here.
      // For now, this form does not authenticate users.

      setError("Admin authentication has not been connected yet.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Left Branding Panel */}
      <section className="admin-login-brand">
        <div className="admin-login-brand-content">
          <div className="admin-login-logo">
            <div className="admin-login-logo-icon">
              <HardHat size={30} strokeWidth={1.8} />
            </div>

            <div className="admin-login-logo-text">
              <h1>
                BUILDER<span>360</span>
              </h1>
              <p>INFRASTRUCTURE & DEVELOPMENT</p>
            </div>
          </div>

          <div className="admin-login-brand-message">
            <span className="admin-login-eyebrow">ADMINISTRATION PORTAL</span>

            <h2>
              Building the
              <br />
              <span>Future.</span>
            </h2>

            <p>
              Manage projects, monitor construction progress, and oversee your
              infrastructure operations from one secure platform.
            </p>

            <div className="admin-login-divider"></div>

            <div className="admin-login-brand-footer">
              <span className="admin-login-status-dot"></span>
              <span>BUILDER360 MANAGEMENT SYSTEM</span>
            </div>
          </div>
        </div>

        <div className="admin-login-background-number">360</div>

        <div className="admin-login-brand-bottom">
          <span>ENGINEERED FOR EXCELLENCE.</span>
          <span>© {new Date().getFullYear()} BUILDER360</span>
        </div>
      </section>

      {/* Right Login Panel */}
      <section className="admin-login-form-section">
        <div className="admin-login-form-wrapper">
          <div className="admin-login-mobile-logo">
            <div className="admin-login-logo-icon">
              <HardHat size={27} strokeWidth={1.8} />
            </div>

            <div className="admin-login-logo-text">
              <h1>
                BUILDER<span>360</span>
              </h1>
              <p>INFRASTRUCTURE & DEVELOPMENT</p>
            </div>
          </div>

          <div className="admin-login-heading">
            <span className="admin-login-form-eyebrow">SECURE ACCESS</span>

            <h2>Welcome back.</h2>

            <p>Enter your administrator credentials to continue.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-login-field">
              <label htmlFor="admin-email">Email Address</label>

              <div className="admin-login-input-wrapper">
                <Mail className="admin-login-input-icon" size={19} />

                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  placeholder="admin@builder360.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">Password</label>

              <div className="admin-login-input-wrapper">
                <LockKeyhole className="admin-login-input-icon" size={19} />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="admin-login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="admin-login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-login-submit"
              disabled={loading}
            >
              <span>{loading ? "Signing in..." : "Sign In to Dashboard"}</span>

              {!loading && <span className="admin-login-arrow">→</span>}
            </button>
          </form>

          <div className="admin-login-security">
            <LockKeyhole size={15} />

            <span>Restricted access. Authorised personnel only.</span>
          </div>

          <div className="admin-login-bottom">
            <span>BUILDER360</span>
            <span>ADMIN PORTAL</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminLogin;
