import React, { useState, useEffect } from "react";
import ClaimForm from "./components/ClaimForm";
import ClaimsList from "./components/ClaimsList";
import LoginRegister from "./components/LoginRegister";
import AdminDashboard from "./components/AdminDashboard";
import { IClaim, ClaimType } from "../types/claim";
import { UserRole } from "../types/user";
import "./styles/App.css";

interface AuthUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [claims, setClaims] = useState<IClaim[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE_URL = window.location.origin;

  // Try to load user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
      }
    }
  }, [token]);

  // Handle authentication success
  const handleAuthSuccess = (newToken: string, authUser: AuthUser) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(authUser));
    setToken(newToken);
    setUser(authUser);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
    setClaims([]);
  };

  // Fetch all claims
  const fetchClaims = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/claims`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setClaims(data.data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      setError("Failed to fetch claims");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmitClaim = async (formData: {
    claimantName: string;
    policyNumber: string;
    claimType: ClaimType;
    claimAmount: number;
  }) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_BASE_URL}/api/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Claim created successfully! ID: ${data.data.claimId}`);
        setClaims([...claims, data.data]);
        setShowForm(false);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || "Failed to create claim");
      }
    } catch (err) {
      setError("Error submitting claim");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update claim status
  const handleUpdateStatus = async (claimId: string, newStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/claims/${claimId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setClaims(
          claims.map((claim) =>
            claim.claimId === claimId ? data.data : claim
          )
        );
        setSuccess(`Claim ${claimId} updated successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Failed to update claim");
      }
    } catch (err) {
      setError("Error updating claim");
      console.error(err);
    }
  };

  // Fetch claims when user logs in
  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  // Show login/register if not authenticated
  if (!token || !user) {
    return <LoginRegister onAuthSuccess={handleAuthSuccess} />;
  }

  // Show admin dashboard if user is admin or claims adjuster
  if (user.role === UserRole.ADMIN || user.role === UserRole.CLAIMS_ADJUSTER) {
    return <AdminDashboard token={token} onLogout={handleLogout} />;
  }

  // Show customer view
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>📋 Claim Management System</h1>
          <p>Manage your insurance claims efficiently</p>
        </div>
        <div className="header-user">
          <span>Welcome, {user.fullName}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="app-content">
        <div className="sidebar">
          <button
            className={`sidebar-btn ${showForm ? "active" : ""}`}
            onClick={() => setShowForm(true)}
          >
            ➕ New Claim
          </button>
          <button
            className={`sidebar-btn ${!showForm ? "active" : ""}`}
            onClick={() => setShowForm(false)}
          >
            📊 View Claims
          </button>
        </div>

        <main className="main-content">
          {showForm ? (
            <ClaimForm
              onSubmit={handleSubmitClaim}
              isLoading={loading}
            />
          ) : (
            <ClaimsList
              claims={claims}
              onUpdateStatus={handleUpdateStatus}
              isLoading={loading}
              onRefresh={fetchClaims}
            />
          )}
        </main>
      </div>
    </div>
  );
}
