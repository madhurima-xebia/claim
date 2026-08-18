import React, { useState } from "react";
import { UserRole } from "../../types/user";
import "../styles/Auth.css";

interface LoginRegisterProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export default function LoginRegister({ onAuthSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: UserRole.CUSTOMER,
  });

  const API_BASE_URL = window.location.origin;

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Login successful!");
        onAuthSuccess(data.token, data.user);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Registration successful! Logging you in...");
        onAuthSuccess(data.token, data.user);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {isLogin ? "Login" : "Register"}
        </h1>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={loginForm.username}
                onChange={handleLoginChange}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={registerForm.fullName}
                onChange={handleRegisterChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={registerForm.username}
                onChange={handleRegisterChange}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={registerForm.role}
                onChange={handleRegisterChange}
              >
                <option value={UserRole.CUSTOMER}>Customer</option>
                <option value={UserRole.CLAIMS_ADJUSTER}>Claims Adjuster</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="Enter a password"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-button"
            >
              {isLogin ? "Register here" : "Login here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
