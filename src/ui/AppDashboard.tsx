import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import ClaimForm from "./components/ClaimForm";
import { IClaim, ClaimType } from "../types/claim";
import "./styles/AppDashboard.css";

export default function AppDashboard() {
  const [claims, setClaims] = useState<IClaim[]>([]);
  const [currentTab, setCurrentTab] = useState<"dashboard" | "form" | "rules">("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE_URL = window.location.origin;

  // Fetch all claims
  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/claims`);
      const data: any = await response.json();
      if (data.success) {
        setClaims(data.data);
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
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_BASE_URL}/api/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: any = await response.json();

      if (data.success) {
        setSuccess(`Claim created successfully! ID: ${data.data.claimId}`);
        setClaims([...claims, data.data]);
        setCurrentTab("dashboard");
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/claims/${claimId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data: any = await response.json();

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

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="app-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">CX</span>
            <span className="logo-text">ClaimX</span>
          </div>
        </div>
        <button
          className="add-btn"
          onClick={() => setCurrentTab("form")}
          title="Add new claim"
        >
          +
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${currentTab === "dashboard" ? "active" : ""}`}
          onClick={() => setCurrentTab("dashboard")}
        >
          Claims Dashboard
        </button>
        <button
          className={`nav-tab ${currentTab === "rules" ? "active" : ""}`}
          onClick={() => setCurrentTab("rules")}
        >
          Business Rules
        </button>
      </nav>

      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Content */}
      <main className="dashboard-content">
        {currentTab === "dashboard" && (
          <Dashboard
            claims={claims}
            onUpdateStatus={handleUpdateStatus}
            isLoading={loading}
            onRefresh={fetchClaims}
          />
        )}
        {currentTab === "form" && (
          <ClaimForm
            onSubmit={handleSubmitClaim}
            isLoading={loading}
          />
        )}
        {currentTab === "rules" && (
          <div className="rules-section">
            <h2>Business Rules</h2>
            <div className="rules-content">
              <p>Business rules configuration coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
